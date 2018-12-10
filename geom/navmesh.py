import recast as dt

def test_sample_tile_mesh(nav_file, q):
    nav_mesh = dt.dtLoadSampleTileMesh(nav_file)
    filter = dt.dtQueryFilter()
    query = dt.dtNavMeshQuery()

    status = query.init(nav_mesh, 2048)
    if dt.dtStatusFailed(status):
        return -1, status

    polyPickExt = dt.dtVec3(2.0, 4.0, 2.0)
    startPos = dt.dtVec3(q[0][0], 1, q[0][1])
    endPos = dt.dtVec3(q[1][0], 1, q[1][1])

    status, out = query.findNearestPoly(startPos, polyPickExt, filter)
    if dt.dtStatusFailed(status):
        return -2, status
    startRef = out["nearestRef"]
    _startPt = out["nearestPt"]

    status, out = query.findNearestPoly(endPos, polyPickExt, filter)
    if dt.dtStatusFailed(status):
        return -3, status
    endRef = out["nearestRef"]
    _endPt = out["nearestPt"]

    status, out = query.findPath(startRef, endRef, startPos, endPos, filter, 32)
    if dt.dtStatusFailed(status):
        return -4, status
    pathRefs = out["path"]

    status, fixEndPos = query.closestPointOnPoly(pathRefs[-1], endPos)
    if dt.dtStatusFailed(status):
        return -5, status

    status, out = query.findStraightPath(startPos, fixEndPos, pathRefs, 32, 0)
    if dt.dtStatusFailed(status):
        return -6, status
    straightPath = out["straightPath"]
    straightPathFlags = out["straightPathFlags"]
    straightPathRefs = out["straightPathRefs"]

    print("{} > {}".format(startPos, endPos))

    
    path=[]
    for i in straightPath:
        path.append((i[0]*100, i[2]*100))

    # z["0"]['lines'].append({"xy":(1000,500),"x1":4020,"y1":930,"strokeColor":"#fff","strokeWidth":2,"opacity":0.7})
    # z["0"]['lines'].append({"xy":(4020,930),"x1":4080,"y1":990,"strokeColor":"#fff","strokeWidth":2,"opacity":0.7})
    # z["0"]['lines'].append({"xy":(4080,990),"x1":4080,"y1":2010,"strokeColor":"#fff","strokeWidth":2,"opacity":0.7})

    return path

z=test_sample_tile_mesh("f0.nav", [(10,5), (35,25)])
for i in z:
    print(i)
