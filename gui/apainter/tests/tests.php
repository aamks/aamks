<!DOCTYPE html>
<html>
<head>
  <title>Apainter Tests</title>
  <script src="mocha.js"></script>
  <script src="chai.js"></script>
  <script src="sinon.js"></script>
  <link rel="stylesheet" href="mocha.css">
</head>
<body>
  <div id="mocha"></div>
  
  <script>
    // Polyfills & mocks
    window.d3 = {
      pointer: (event, node) => [100, 200],
      select: el => ({
        attr: sinon.stub().returnsThis(),
        on: sinon.stub().returnsThis(),
        call: sinon.stub().returnsThis(),
        append: name => ({
          attr: sinon.stub().returnsThis()
        }),
        classed: sinon.stub().returnsThis()
      }),
      zoom: () => ({
        scaleExtent: () => ({ returnsThis: true }),
        translateExtent: () => ({ returnsThis: true }),
        filter: () => ({ returnsThis: true }),
        on: () => ({ returnsThis: true })
      }),
      zoomIdentity: { translate: () => ({}), scale: () => ({}) },
      scaleLinear: () => ({}),
      axisBottom: () => ({}),
      axisRight: () => ({})
    };
    window.expect = chai.expect;
    window.assert = chai.assert;
    window.$ = function(selector) {
      return {
        on: sinon.stub().returnsThis(),  // for .on("click", ...)
        off: sinon.stub().returnsThis(),
        click: sinon.stub().returnsThis(),
        attr: sinon.stub().returnsThis(),
        width: sinon.stub().returns(800),
        height: sinon.stub().returns(600),
        select: sinon.stub().returnsThis(),
      };
    };

    // Load apainter.js
    const script = document.createElement('script');
    script.src = '../js/apainter.js';
    document.head.appendChild(script);

    script.onload = () => {
      mocha.setup({
        ui: 'bdd',
        timeout: 2000,
        color: 'candy'
      });
      mocha.checkLeaks();

      describe('Apainter Core Tests', () => {
        let originalState;

        beforeEach(() => {
          originalState = window.state;
          window.state = {
            scene: { objects: [{
      "name": "r1",
      "idx": 1,
      "letter": "r",
      "type": "room",
      "floor": 0,
      "polypoints": [
        [
          500,
          500
        ],
        [
          1500,
          500
        ],
        [
          1500,
          1500
        ],
        [
          500,
          1500
        ]
      ],
      "z": {
        "z0": 0,
        "z1": 350
      },
      "minx": 500,
      "miny": 500,
      "maxx": 1500,
      "maxy": 1500,
      "roomExitsWeights": {},
      "evacueesDensity": "auto",
      "lines": [
        [
          500,
          500
        ],
        [
          1500,
          500
        ],
        [
          1500,
          1500
        ],
        [
          500,
          1500
        ]
      ]
    },
    {
      "name": "r2",
      "idx": 2,
      "letter": "r",
      "type": "room",
      "floor": 0,
      "polypoints": [
        [
          1500,
          500
        ],
        [
          2500,
          500
        ],
        [
          2500,
          1500
        ],
        [
          1500,
          1500
        ]
      ],
      "z": {
        "z0": 0,
        "z1": 350
      },
      "minx": 1500,
      "miny": 500,
      "maxx": 2500,
      "maxy": 1500,
      "roomExitsWeights": {
        "2": "10",
        "3": "10"
      },
      "evacueesDensity": "auto",
      "lines": [
        [
          1500,
          500
        ],
        [
          2500,
          500
        ],
        [
          2500,
          1500
        ],
        [
          1500,
          1500
        ]
      ]
    },
    {
      "name": "c3",
      "idx": 3,
      "letter": "c",
      "type": "room",
      "floor": 0,
      "polypoints": [
        [
          500,
          1500
        ],
        [
          3500,
          1500
        ],
        [
          3500,
          2500
        ],
        [
          500,
          2500
        ]
      ],
      "z": {
        "z0": 0,
        "z1": 350
      },
      "minx": 500,
      "miny": 1500,
      "maxx": 3500,
      "maxy": 2500,
      "roomExitsWeights": {},
      "evacueesDensity": "auto",
      "lines": [
        [
          500,
          1500
        ],
        [
          3500,
          1500
        ],
        [
          3500,
          2500
        ],
        [
          500,
          2500
        ]
      ]
    },
    {
      "name": "s5",
      "idx": 5,
      "letter": "s",
      "type": "room",
      "floor": 0,
      "polypoints": [
        [
          3500,
          1500
        ],
        [
          4500,
          1500
        ],
        [
          4500,
          2500
        ],
        [
          3500,
          2500
        ]
      ],
      "z": {
        "z0": 0,
        "z1": 700
      },
      "minx": 3500,
      "miny": 1500,
      "maxx": 4500,
      "maxy": 2500,
      "roomExitsWeights": {
        "6": "10"
      },
      "evacueesDensity": "auto",
      "lines": [
        [
          3500,
          1500
        ],
        [
          4500,
          1500
        ],
        [
          4500,
          2500
        ],
        [
          3500,
          2500
        ]
      ]
    },
    {
      "name": "vs1",
      "idx": 1,
      "floor": 1,
      "letter": "vs",
      "type": "vroom",
      "lines": [
        [
          3500,
          1500
        ],
        [
          4500,
          1500
        ],
        [
          4500,
          2500
        ],
        [
          3500,
          2500
        ]
      ],
      "polypoints": [
        [
          3500,
          1500
        ],
        [
          4500,
          1500
        ],
        [
          4500,
          2500
        ],
        [
          3500,
          2500
        ]
      ],
      "z": {
        "z0": 0,
        "z1": 700
      },
      "roomExitsWeights": {
        "6": "10"
      },
      "evacueesDensity": "auto",
      "minx": 3500,
      "miny": 1500,
      "maxx": 4500,
      "maxy": 2500
    },
    {
      "name": "a4",
      "idx": 4,
      "letter": "a",
      "type": "room",
      "floor": 0,
      "polypoints": [
        [
          2500,
          500
        ],
        [
          3500,
          500
        ],
        [
          3500,
          1500
        ],
        [
          2500,
          1500
        ]
      ],
      "z": {
        "z0": 0,
        "z1": 350
      },
      "minx": 2500,
      "miny": 500,
      "maxx": 3500,
      "maxy": 1500,
      "roomExitsWeights": {},
      "evacueesDensity": "auto",
      "lines": [
        [
          2500,
          500
        ],
        [
          3500,
          500
        ],
        [
          3500,
          1500
        ],
        [
          2500,
          1500
        ]
      ]
    },
    {
      "name": "t1",
      "idx": 1,
      "letter": "t",
      "type": "obst",
      "floor": 0,
      "polypoints": [
        [
          1750,
          750
        ],
        [
          2250,
          750
        ],
        [
          2250,
          1250
        ],
        [
          1750,
          1250
        ]
      ],
      "z": {
        "z0": 0,
        "z1": 100
      },
      "minx": 1750,
      "miny": 750,
      "maxx": 2250,
      "maxy": 1250,
      "lines": [
        -100000,
        -100000,
        -100000,
        -100000,
        -100000,
        -100000,
        -100000,
        -100000
      ]
    },
    {
      "name": "b1",
      "idx": 1,
      "letter": "b",
      "type": "vvent",
      "floor": 0,
      "polypoints": [
        [
          3750,
          1750
        ],
        [
          4250,
          1750
        ],
        [
          4250,
          2250
        ],
        [
          3750,
          2250
        ]
      ],
      "z": {
        "z0": 0,
        "z1": 50
      },
      "minx": 3750,
      "miny": 1750,
      "maxx": 4250,
      "maxy": 2250,
      "lines": [
        -100000,
        -100000,
        -100000,
        -100000,
        -100000,
        -100000,
        -100000,
        -100000
      ]
    },
    {
      "name": "m1",
      "idx": 1,
      "letter": "m",
      "type": "mvent",
      "floor": 0,
      "polypoints": [
        [
          2750,
          750
        ],
        [
          3250,
          750
        ],
        [
          3250,
          1250
        ],
        [
          2750,
          1250
        ]
      ],
      "z": {
        "z0": 0,
        "z1": 50
      },
      "minx": 2750,
      "miny": 750,
      "maxx": 3250,
      "maxy": 1250,
      "mventThroughput": 1.5,
      "flowDirection": "r2 to OUTSIDE",
      "airGrilleSurface": "x_min",
      "lines": [
        -100000,
        -100000,
        -100000,
        -100000,
        -100000,
        -100000,
        -100000,
        -100000
      ]
    },
    {
      "name": "z3",
      "idx": 3,
      "letter": "z",
      "type": "hole",
      "floor": 0,
      "polypoints": [
        [
          2484,
          500
        ],
        [
          2516,
          500
        ],
        [
          2516,
          1500
        ],
        [
          2484,
          1500
        ]
      ],
      "z": {
        "z0": 0,
        "z1": 350
      },
      "minx": 2484,
      "miny": 500,
      "maxx": 2516,
      "maxy": 1500,
      "lines": [
        -100000,
        -100000,
        -100000,
        -100000,
        -100000,
        -100000,
        -100000,
        -100000
      ]
    },
    {
      "name": "w4",
      "idx": 4,
      "letter": "w",
      "type": "window",
      "floor": 0,
      "polypoints": [
        [
          700,
          484
        ],
        [
          1000,
          484
        ],
        [
          1000,
          516
        ],
        [
          700,
          516
        ]
      ],
      "z": {
        "z0": 100,
        "z1": 250
      },
      "minx": 700,
      "miny": 484,
      "maxx": 1000,
      "maxy": 516,
      "lines": [
        -100000,
        -100000,
        -100000,
        -100000,
        -100000,
        -100000,
        -100000,
        -100000
      ]
    },
    {
      "name": "d1",
      "idx": 1,
      "letter": "d",
      "type": "door",
      "floor": 0,
      "polypoints": [
        [
          700,
          1484
        ],
        [
          790,
          1484
        ],
        [
          790,
          1516
        ],
        [
          700,
          1516
        ]
      ],
      "z": {
        "z0": 0,
        "z1": 200
      },
      "minx": 700,
      "miny": 1484,
      "maxx": 790,
      "maxy": 1516,
      "exitWeight": "10",
      "lines": [
        -100000,
        -100000,
        -100000,
        -100000,
        -100000,
        -100000,
        -100000,
        -100000
      ]
    },
    {
      "name": "d2",
      "idx": 2,
      "letter": "d",
      "type": "door",
      "floor": 0,
      "polypoints": [
        [
          2000,
          1484
        ],
        [
          2090,
          1484
        ],
        [
          2090,
          1516
        ],
        [
          2000,
          1516
        ]
      ],
      "z": {
        "z0": 0,
        "z1": 200
      },
      "minx": 2000,
      "miny": 1484,
      "maxx": 2090,
      "maxy": 1516,
      "exitWeight": "10",
      "lines": [
        -100000,
        -100000,
        -100000,
        -100000,
        -100000,
        -100000,
        -100000,
        -100000
      ]
    },
    {
      "name": "ku1",
      "idx": 1,
      "letter": "ku",
      "type": "floor_teleport",
      "floor": 0,
      "polypoints": [
        [
          4000,
          2000
        ],
        [
          4020,
          2000
        ],
        [
          4020,
          2070
        ],
        [
          4000,
          2070
        ]
      ],
      "z": {
        "z0": 0,
        "z1": 350
      },
      "minx": 4000,
      "miny": 2000,
      "maxx": 4020,
      "maxy": 2070,
      "exitWeight": "10",
      "teleportFrom": [
        3728,
        1829
      ],
      "teleportTo": [
        3728,
        1759
      ],
      "lines": [
        -100000,
        -100000,
        -100000,
        -100000,
        -100000,
        -100000,
        -100000,
        -100000
      ]
    },
    {
      "name": "q5",
      "idx": 5,
      "letter": "q",
      "type": "door",
      "floor": 0,
      "polypoints": [
        [
          484,
          2000
        ],
        [
          516,
          2000
        ],
        [
          516,
          2090
        ],
        [
          484,
          2090
        ]
      ],
      "z": {
        "z0": 0,
        "z1": 200
      },
      "minx": 484,
      "miny": 2000,
      "maxx": 516,
      "maxy": 2090,
      "exitWeight": "10",
      "lines": [
        -100000,
        -100000,
        -100000,
        -100000,
        -100000,
        -100000,
        -100000,
        -100000
      ]
    },
    {
      "name": "e6",
      "idx": 6,
      "letter": "e",
      "type": "door",
      "floor": 0,
      "polypoints": [
        [
          3484,
          1993
        ],
        [
          3516,
          1993
        ],
        [
          3516,
          2090
        ],
        [
          3484,
          2090
        ]
      ],
      "z": {
        "z0": 0,
        "z1": 200
      },
      "minx": 3484,
      "miny": 1993,
      "maxx": 3516,
      "maxy": 2090,
      "exitWeight": "10",
      "lines": [
        -100000,
        -100000,
        -100000,
        -100000,
        -100000,
        -100000,
        -100000,
        -100000
      ]
    },
    {
      "name": "f1",
      "idx": 1,
      "letter": "f",
      "type": "evacuee",
      "floor": 0,
      "polypoints": [
        [
          750,
          800
        ]
      ],
      "z": {
        "z0": 50,
        "z1": 50
      },
      "minx": 750,
      "miny": 800,
      "maxx": 750,
      "maxy": 800,
      "lines": [
        -100000,
        -100000,
        -100000,
        -100000,
        -100000,
        -100000,
        -100000,
        -100000
      ]
    },
    {
      "name": "f2",
      "idx": 2,
      "letter": "f",
      "type": "evacuee",
      "floor": 0,
      "polypoints": [
        [
          1250,
          800
        ]
      ],
      "z": {
        "z0": 50,
        "z1": 50
      },
      "minx": 1250,
      "miny": 800,
      "maxx": 1250,
      "maxy": 800,
      "lines": [
        -100000,
        -100000,
        -100000,
        -100000,
        -100000,
        -100000,
        -100000,
        -100000
      ]
    },
    {
      "name": "y1",
      "idx": 1,
      "letter": "y",
      "type": "fire",
      "floor": 0,
      "polypoints": [
        [
          750,
          1000
        ],
        [
          1250,
          1000
        ],
        [
          1250,
          1250
        ],
        [
          750,
          1250
        ]
      ],
      "z": {
        "z0": 0,
        "z1": 250
      },
      "minx": 750,
      "miny": 1000,
      "maxx": 1250,
      "maxy": 1250,
      "lines": [
        -100000,
        -100000,
        -100000,
        -100000,
        -100000,
        -100000,
        -100000,
        -100000
      ]
    },
    {
      "name": "kd2",
      "idx": 2,
      "letter": "kd",
      "type": "floor_teleport",
      "floor": 1,
      "polypoints": [
        [
          3796,
          1748
        ],
        [
          3806,
          1818
        ],
        [
          3786,
          1818
        ],
        [
          3796,
          1748
        ]
      ],
      "z": {
        "z0": 350,
        "z1": 350
      },
      "minx": 3786,
      "miny": 1748,
      "maxx": 3806,
      "maxy": 1818,
      "exitWeight": 10,
      "teleportFrom": [
        3796,
        1818
      ],
      "teleportTo": [
        3796,
        1748
      ],
      "lines": [
        -100000,
        -100000,
        -100000,
        -100000,
        -100000,
        -100000,
        -100000,
        -100000
      ]
    }] },
            zoomTransform: { x: 0, y: 0, k: 1 },
            currentFloor: 0,
            defaults: { evacueeRadius: 25, snapForceHole: 100 },
            svg: { on: sinon.stub(), call: sinon.stub() },
            selectionRect: { attr: sinon.stub().returnsThis() },
            floorsZ0: { 0: 0 },
            floorsDimZ: { 0: 350 }
          };
        });

        afterEach(() => {
          window.state = originalState;
          });
        describe('Database', () => {
          it('dbWhere filters by equality', () => {
            const result = dbWhere({ floor: 0 });
            assert.equal(result.length, 18);
            assert.equal(result[0].name, 'r1');
          });

          it('dbWhere supports function predicates', () => {
            const result = dbWhere({ minx: v => v < 501 });
            assert.equal(result.length, 3);
            assert.equal(result[0].minx, 500);
          });

          it('dbBetweenNames returns intersecting object names', () => {
            const rect = { minx: 750, maxx: 1250, miny: 800, maxy: 1250 };
            const names = dbBetweenNames(rect);
            assert.deepEqual(names, ["r1", "f1", "f2", "y1"]);
          });
        });

        describe('Geometry', () => {
          it('scaleMouse converts SVG to world coordinates', () => {
            state.zoomTransform = { x: 50, y: 60, k: 2 };
            const result = scaleMouse([150, 260]);
            assert.deepEqual(result, {x: 50, y: 100});
          });

          it('updateBbox calculates bounds correctly', () => {
            const obj = { polypoints: [[500,700], [1500,700], [1500,1400], [500,1400]] };
            updateBbox(obj);
            assert.equal(obj.minx, 500);
            assert.equal(obj.maxx, 1500);
            assert.equal(obj.miny, 700);
            assert.equal(obj.maxy, 1400);
          });
        });

      //   describe('Selection', () => {
      //   it('setupSelectionBox registers events on svg', () => {
            
      //       registerListeners();
      //       console.log('svg.on calls:', state.svg.on.args.map(([event]) => event));

      //       sinon.assert.calledWith(state.svg, 'mousedown.select');
      //       sinon.assert.calledWith(state.svg, 'mousemove.select');
      //       sinon.assert.calledWith(state.svg, 'mouseup.select');
      //       // sinon.assert.calledWith(state.svg.on, 'mousedown.select');
      //       // sinon.assert.calledWith(state.svg.on, 'mousemove.select');
            
      //     });
      //   afterEach(() => {
      //     // state.svg.on.restore();
      //   });
      // });
    })
      mocha.run((failures) => {
        console.log(`Tests complete. Failures: ${failures}`);
      });
    };
  </script>
</body>
</html>
