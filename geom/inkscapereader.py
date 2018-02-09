# MODULES
# {{{
from pprint import pprint
from collections import OrderedDict
from xml.dom import minidom
import math
import os
import sys
import codecs
import webcolors
from include import Sqlite
from include import Json
from include import Dump as dd

# }}}

class InkscapeReader():
    def __init__(self):# {{{
        ''' 
        The reader of svg created by inkscape. There's a trick: svg has origin
        at top left, while inkscape "cheats" like it is at bottom left. So it's
        inkscape that flips Y axis so that it looks like CAD. We need to
        recalculate the Y axis in our final svg.json so that the user sees the
        same on web (pure svg) and in inkscape GUI. Other svg tools could do it
        different, so we are inkscape specific. Inkscape must draw in px units.
        1234 units in inkscape maps to 12.34 metres in aamks. 
        '''

        self.json=Json()
        self._types=self.json.read("{}/geom/colors.json".format(os.environ['AAMKS_PATH']))['darkColors']
        self._colors=dict((v,k) for k,v in self._types.items())
        self.map=OrderedDict([ ('ROOM', "ROOM" ), ('COR', "CORRIDOR" ), ('D', "DOOR_PLAIN" ), ('HOLE', "HOLE" ), ('C', "DOOR_CLOSER" ), ('E', "DOOR_ELECTROMAGNET"), ('W', "WINDOW" ), ('HALL', "HALL" ), ('STAI', "STAIRCASE" ), ('VNT', "VVENT" ) ])
        self._write_inkscape_palette()
        self._elems=[]
        self._read_svg()
        self._asJson()
# }}}
    def _write_inkscape_palette(self):# {{{
        ''' Based on colors.json write inkscape palette to ~/.config/inkscape/palettes/aamks.gpl '''

        palette=[]
        palette.append("GIMP Palette")
        palette.append("Name: aamks")
        palette.append("Columns: 3")
        palette.append("#")

        for k,v in self.map.items():
            palette.append("{} {}".format("\t".join(str(i ) for i in webcolors.hex_to_rgb(self._types[k])), v  ))

        p="{}/.config/inkscape/palettes/aamks.gpl".format(os.environ['HOME'])
        with open(p, "w") as f: 
            print("Inkscape palette saved to {}".format(p))
            f.write("\n".join(palette))
        # }}}
    def _color2type(self,s):# {{{
        arr=s.split(";")
        for i in arr:
            if i[:5]=='fill:':
                color=i[5:]
        return self._colors[color]

# }}}
    def _read_svg(self):# {{{
        ''' 
        Read rectangles from svg tree. Since svg is 2D, we only support
        floor="1" with x,y and fixed z=3m. At the end we have json of this
        form: 

            "1": {
                 "ROOM": [
                     [ [ 10, 10, 0 ], [ 11, 20, 3 ] ]
                     [ [ 11, 10, 0 ], [ 15, 20, 3 ] ]
                     [ [ 50, 10, 0 ], [ 60, 20, 3 ] ]
                   ],
                   "D": [
                     [ [ 10, 11, 0 ], [ 10, 12, 2 ] ]
                   ]
            }
        '''
        doc = minidom.parse("{}/input.svg".format(os.environ['AAMKS_PROJECT']))
        inkscape_height=float(doc.getElementsByTagName('svg')[0].getAttribute('height'))

        for i in doc.getElementsByTagName('rect'):
            record=OrderedDict()
            if i.getAttribute('transform')!='':
                raise Exception("The svg element id={} has transformations, which is not allowed. Inspect your svg xml file.".format(i.getAttribute('id')))
            for attr in ('x', 'y', 'width', 'height'):
                record[attr]=float(i.getAttribute(attr))

            record['type']=self._color2type(i.getAttribute('style'))
            record['y']=inkscape_height - record['height'] - record['y']
            self._elems.append(record)
# }}}
    def _asJson(self):# {{{
        ''' 
        All the rounding() in this importer must happen no ealier than at the
        very end. Otherwise we would have rounding errors in inkscape_height -
        y 
        '''

        json=OrderedDict()
        json["1"]=OrderedDict()
        for i in self.map.keys():
            json["1"][i]=[]
        for i in self._elems:
            json["1"][i['type']].append([ [round(i['x']/100,2), round(i['y']/100,2), 0 ], [round((i['x']+i['width'])/100,2), round((i['y']+i['height'])/100,2), 3 ] ])
        self.json.write(json, "{}/svg.json".format(os.environ['AAMKS_PROJECT']))

# }}}
