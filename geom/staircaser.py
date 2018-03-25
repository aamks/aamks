from collections import OrderedDict
import json
from shapely.geometry import box
from shapely.affinity import rotate, scale

class Staircaser():
    def __init__(self, bottom, fheight, floors, swidth=2, variant='all'):# {{{
        ''' 
        bottom      : the projection of the staircase onto XY plane
        fheight     : floor height
        floors      : number of floors
        swidth      : stair width, default=2
        variant     : 'all' | '0_0' | '-0_0' | '180_0' | '-180_0' | '0_1' | '-0_1' | '180_1' | '-180_1', default='all'

        We will produce a json with all the 8 orientations of stairs runs: 
            2 along_side (Y vs X) * 2 rotations * 2 directions (CW vs CCW) 

        along Y or X are called orientation within the script.

        Variants encode 'rotation_orientation', 0=Y, 1=X.
        '''

        self.fheight=fheight
        self.floors=floors
        self.swidth=swidth

        self._on_init(bottom)
        self._single_stair_height_and_width()
        for i in (0,1):
            self.orientation=i
            self._geoms=list()
            self._make_landings(bottom)
            self._make_stairs()
            self._make_pillar()
            self._geoms_defs()
            self._affine_transforms()
        self.json=self._output_variant(variant) 
# }}}
    def _on_init(self,bottom):# {{{
        ''' 
        Prepare json structure for geoms. 
        '''

        self.collect=OrderedDict()
        self.collect['staircases']=OrderedDict()
        cx=bottom[0][0] + 0.5 * (bottom[1][0] - bottom[0][0])
        cy=bottom[0][1] + 0.5 * (bottom[1][1] - bottom[0][1])
        cz=bottom[0][2] + 0.5 * (bottom[1][2] - bottom[0][2])
        self.staircase_center=(cx,cy,cz)

# }}}
    def _single_stair_height_and_width(self):# {{{
        '''
        Single floor:

                    |\
                  h | \ stairs
                    |  \ 
                    +----
        landing0            landing1


        sh: single stair height should be ~ 20cm 
        sw: single stair width should be ~ 29cm 

        We measure h. Then we see how many stairs we can have in vertical. 15.3
        stairs needs to be rounded to 15 stairs. 15 stairs in horizontal
        measures how much of the staircase will be left for landings.
        '''

        h=self.fheight/2

        how_many=int(h/0.2)
        sh=h/how_many
        sw=0.29
        self.how_many_stairs=how_many
        self.sh=sh
        self.sw=sw
        assert how_many*sh >= self.fheight/2, "Floor is too high for ~0.2m stairs"

# }}}
    def _make_landings(self,bottom):# {{{
        '''
        From the 8 orientations there are just 2 interesting:
        0: stairs along Y
        1: stairs along X
        
        The rest is just rotations or mirrors transformations.
        '''

        if self.orientation == 0: 
            self._make_landings_0(bottom)
        else:
            self._make_landings_1(bottom)

#}}}
    def _make_stairs(self):# {{{
        '''
        From the 8 orientations there are just 2 interesting:
        0: stairs along Y
        1: stairs along X
        
        The rest is just rotations or mirrors transformations.
        '''

        if self.orientation == 0: 
            self._make_stairs_0()
        else:
            self._make_stairs_1()
# }}}

    def _make_landings_0(self,bottom): # {{{
        x0=bottom[0][0]
        x1=bottom[1][0]
        y0=bottom[0][1]
        y1=bottom[1][1]
        z0=bottom[0][2]
        z1=bottom[1][2]

        center_x = x0 + 0.5 * (x1 - x0)
        center_y = y0 + 0.5 * (y1 - y0)
        center_z = 0

        l0=dict()
        l1=dict()
        self.lwidth=0.5 * ( (y1-y0) -  self.sw * self.how_many_stairs) 
        l0['p0']=bottom[0]
        l0['p1']=(x1, y0+self.lwidth, z1)
        l0['center_x']=l0['p0'][0] + 0.5 * (l0['p1'][0] - l0['p0'][0])
        l0['center_y']=l0['p0'][1] + 0.5 * (l0['p1'][1] - l0['p0'][1])
        l0['center_z']=0

        l1['p0']=(x0, y1-self.lwidth, z1)
        l1['p1']=bottom[1]
        l1['center_x']=l1['p0'][0] + 0.5 * (l1['p1'][0] - l1['p0'][0])
        l1['center_y']=l1['p0'][1] + 0.5 * (l1['p1'][1] - l1['p0'][1])
        l1['center_z']=0

        l0['size']=(x1-x0, self.lwidth, center_z)
        l1['size']=(x1-x0, self.lwidth, center_z)

        self.landings=list()
        self.landings.append(l0)
        self.landings.append(l1)

# }}}
    def _make_stairs_0(self):# {{{
        sh=self.sh
        sw=self.sw
        for f in range(self.floors):
            for i in range(self.how_many_stairs):
                center=(self.landings[0]['p0'][0]+0.5*self.swidth, self.landings[0]['p1'][1]+i*sw+0.5*sw, f*self.fheight  + i*sh+0.5*sh)
                size=(self.swidth/2,sw/2,sh/2)
                self._make_single_stair(center,size)

            i+=1
            center=(self.landings[1]['center_x'], self.landings[1]['center_y'], f*self.fheight + i*sh+0.5*sh)
            size=(self.landings[1]['size'][0]/2, self.landings[1]['size'][1]/2, sh/2)
            self._make_single_stair(center,size)

            for i in range(self.how_many_stairs):
                center=(self.landings[1]['p1'][0]-0.5*self.swidth, self.landings[1]['p0'][1]-i*sw-0.5*sw, f*self.fheight + self.how_many_stairs*sh+i*sh+0.5*sh)
                size=(self.swidth/2,sw/2,sh/2)
                self._make_single_stair(center,size)
            i+=1
            center=(self.landings[0]['center_x'], self.landings[0]['center_y'], f*self.fheight + self.how_many_stairs*sh+i*sh+0.5*sh)
            size=(self.landings[1]['size'][0]/2, self.landings[1]['size'][1]/2, sh/2)
            self._make_single_stair(center,size)

        center=(self.landings[0]['p0'][0]+0.5*self.swidth, self.landings[0]['p1'][1]+0.5*sw, f*self.fheight + self.how_many_stairs*sh+i*sh+ 1)
        size=(self.swidth/2,sw/2,1)
        self._make_single_stair(center,size)

# }}}

    def _make_landings_1(self,bottom): # {{{
        x0=bottom[0][0]
        x1=bottom[1][0]
        y0=bottom[0][1]
        y1=bottom[1][1]
        z0=bottom[0][2]
        z1=bottom[1][2]

        center_x = x0 + 0.5 * (x1 - x0)
        center_y = y0 + 0.5 * (y1 - y0)
        center_z = 0

        l0=dict()
        l1=dict()
        self.lwidth=0.5 * ( (x1-x0) -  self.sw * self.how_many_stairs) 
        l0['p0']=bottom[0]
        l0['p1']=(x0+self.lwidth, y1, z1)
        l0['center_x']=l0['p0'][0] + 0.5 * (l0['p1'][0] - l0['p0'][0])
        l0['center_y']=l0['p0'][1] + 0.5 * (l0['p1'][1] - l0['p0'][1])
        l0['center_z']=0

        l1['p0']=(x1-self.lwidth, y0, z1)
        l1['p1']=bottom[1]
        l1['center_x']=l1['p0'][0] + 0.5 * (l1['p1'][0] - l1['p0'][0])
        l1['center_y']=l1['p0'][1] + 0.5 * (l1['p1'][1] - l1['p0'][1])
        l1['center_z']=0

        l0['size']=(self.lwidth, y1-y0, center_z)
        l1['size']=(self.lwidth, y1-y0, center_z)

        self.landings=list()
        self.landings.append(l0)
        self.landings.append(l1)

# }}}
    def _make_stairs_1(self):# {{{
        sh=self.sh
        sw=self.sw
        for f in range(self.floors):
            for i in range(self.how_many_stairs):
                center=(self.landings[0]['p1'][0]+i*sw+0.5*sw, self.landings[0]['p0'][1]+0.5*self.swidth, f*self.fheight + i*sh+0.5*sh)
                size=(sw/2,self.swidth/2,sh/2)
                self._make_single_stair(center,size)
            i+=1
            center=(self.landings[1]['center_x'], self.landings[1]['center_y'], f*self.fheight + i*sh+0.5*sh)
            size=(self.landings[1]['size'][0]/2, self.landings[1]['size'][1]/2, sh/2)
            self._make_single_stair(center,size)

            for i in range(self.how_many_stairs):
                center=(self.landings[1]['p0'][0]-i*sw-0.5*sw, self.landings[1]['p1'][1]-0.5*self.swidth, f*self.fheight + self.how_many_stairs*sh+i*sh+0.5*sh)
                size=(sw/2,self.swidth/2,sh/2)
                self._make_single_stair(center,size)
            i+=1
            center=(self.landings[0]['center_x'], self.landings[1]['center_y'], f*self.fheight + self.how_many_stairs*sh+i*sh+0.5*sh)
            size=(self.landings[1]['size'][0]/2, self.landings[1]['size'][1]/2, sh/2)
            self._make_single_stair(center,size)

        center=(self.landings[0]['p1'][0]+0.5*sw, self.landings[1]['p0'][1]+0.5*self.swidth, f*self.fheight + self.how_many_stairs*sh+i*sh+ 1)
        size=(sw/2, self.swidth/2,1)
        self._make_single_stair(center,size)

# }}}

    def _make_pillar(self):# {{{
        cx=self.staircase_center[0]
        cy=self.staircase_center[1]
        if self.orientation == 0: 
            sx=0.5 * (self.landings[0]['size'][0] - 2 * self.swidth)
            sy=0.5 * self.how_many_stairs * self.sw
            center=(cx, cy, self.fheight * self.floors * 0.5 + 1)
            size=(max(0.01 , sx) , sy , self.floors * self.fheight/2 + 1)
        else:
            sx=0.5 * self.how_many_stairs * self.sw
            sy=0.5 * (self.landings[0]['size'][1] - 2 * self.swidth)
            center=(cx, cy, self.fheight * self.floors * 0.5 + 1)
            size=(sx , max(0.01 , sy) , self.floors * self.fheight/2 + 1)

        self._geoms.append(dict([ ('center', center), ('size', size) ]))
# }}}
    def _make_single_stair(self,center,size):# {{{
        self._geoms.append(dict([ ('center', center), ('size', size) ]))

# }}}
    def _geoms_defs(self):# {{{
        '''
        Geoms are in center + size format. Blender likes it. But CAD prefers P0
        + P1 as geoms definitions. 
        '''

        z=[]
        for i in self._geoms:
            x0=i['center'][0] - i['size'][0]
            y0=i['center'][1] - i['size'][1]
            z0=i['center'][2] - i['size'][2]

            x1=i['center'][0] + i['size'][0]
            y1=i['center'][1] + i['size'][1]
            z1=i['center'][2] + i['size'][2]

            m=OrderedDict()

            m['center']=[ round(x,3) for x in i['center'] ]
            m['size']=[ round(x,3) for x in i['size'] ]
            m['p0']=[ round(x,3) for x in (x0,y0,z0) ]
            m['p1']=[ round(x,3) for x in (x1,y1,z1) ]

            z.append(m)

        self._geoms=z

# }}}
    def _affine_transforms(self):# {{{
        ''' 
        Generate 2 rotations and 2 mirrors from a single input set. Scale(-1)
        gives the mirror effect. The data var is for passing the z coord, since
        shapley is 2D, so only transforms x,y.
        '''

        self.boxen=list()
        for i in self._geoms:
            self.boxen.append((box(i['p0'][0], i['p0'][1], i['p1'][0], i['p1'][1]),i))

        for angle in (0,180):
            label0="{}_{}".format(angle,  self.orientation)
            label1="-{}_{}".format(angle,  self.orientation)
            self.collect['staircases'][label0]=list()
            self.collect['staircases'][label1]=list()
            for i in self.boxen:

                shape=i[0]
                data=i[1]

                rotated=rotate(geom=shape, angle=angle, origin=self.staircase_center)
                rr=self._shapely_extract(rotated,data)
                self.collect['staircases'][label0].append(rr)

                mirrored=scale(rotated, xfact=-1, yfact=1, origin=self.staircase_center)
                mm=self._shapely_extract(mirrored,data)
                self.collect['staircases'][label1].append(mm)

# }}}
    def _shapely_extract(self,box,data):# {{{
        coords=box.exterior.coords.xy

        p0=min(coords[0]),min(coords[1]),data['p0'][2]
        p1=max(coords[0]),max(coords[1]),data['p1'][2]
        center=( p0[0] + 0.5 * (p1[0]-p0[0]), p0[1] + 0.5 * (p1[1]-p0[1]), p0[2] + 0.5 * (p1[2]-p0[2]))
        size=(center[0]-p0[0], center[1]-p0[1], center[2]-p0[2])

        p0     = [ round(x,3) for x in p0 ]
        p1     = [ round(x,3) for x in p1 ]
        center = [ round(x,3) for x in center ]
        size   = [ round(x,3) for x in size ]

        return dict([ ('center', center), ('size', size), ('p0', p0), ('p1', p1) ])
# }}}
    def _output_variant(self,variant):# {{{
        if variant == 'all':
            picks=[ '0_0', '-0_0', '180_0', '-180_0', '0_1', '-0_1', '180_1', '-180_1' ]
        else:
            picks=[ variant ]

        try:
            out=[]
            for i in picks:
                out.append(self.collect['staircases'][i])
                return json.dumps(out)
        except:
            print("Variant must be one of: 'all' | '0_0' | '-0_0' | '180_0' | '-180_0' | '0_1' | '-0_1' | '180_1' | '-180_1'")

# }}}
# }}}
