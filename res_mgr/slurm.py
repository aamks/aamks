import argparse
from simple_slurm import Slurm


# launch aamks jobs
def launch(path: str, user_id: int):
    pass


# launch postprocessing
def postprocess(path: str, user_id: int, scenarios: str):
    pass


# prepare animation files
def animation(path: str, user_id: int, scenario_id: str, iteration: int):
    pass


# delete jobs
def delete(path: str, user_id: int, scenario_id: str):
    pass


#ARGS
def _argparse():
    parser = argparse.ArgumentParser(description='slurm wrapper')

    parser.add_argument('-t','--type', help='''Type of job:\n
            "l"/"launch" - launch batch of AAMKS simulations (-p and -u required),\n
            "p"/"postprocess" - launch postprocess (-p, -u, -s required),\n
            "a"/"animation" - prepare animation files (-p, -u, -s, -i required),\n
            "d"/"removejobs" - remove all jobs from scenario (-p, -u, -s required)''',
            required=True)

    parser.add_argument('-p', '--path', help='Path to AAMKS scenario', required=False)
    parser.add_argument('-u','--userid', help='AAMKS user ID', required=False)
    parser.add_argument('-r', '--project', help='AAMKS project ID', required=False)
    parser.add_argument('-s', '--scenario', help='AAMKS scenario ID or scenario names to be compared (see results.beck_new)', required=False)
    parser.add_argument('-i', '--iteration', help='Iteration no.', required=False)

    return parser.parse_args()


if __name__ == '__main__':
    args = _argparse()

    if args.type in ['l', 'launch']:
        if not all([args.path, args.userid]):
            raise Exception('Specify path and userid arguments with -p and -u flags')
        launch(args.path, args.userid)

    elif args.type in ['p', 'pos.pathrocess']:
        if not all([args.path, args.userid, args.scenario]):
            raise Exception('Specify path, userid and scenario arguments with -p, -u and -s flags')
        postprocess(args.path, args.userid, args.scenario)

    elif args.type in ['a', 'animation']:
        if not all([args.path, args.userid, args.scenario, args.iteration]):
            raise Exception('Specify path, userid, scenario and iteration arguments with -p, -u, -s and -i flags')
        animation(args.path, args.userid, args.scenario, args.itearation)

    elif args.type in ['d', 'removejobs']:
        if not all([args.path, args.userid, args.scenario]):
            raise Exception('Specify path, userid and scenario arguments with -p, -u and -s flags')
        delete(args.path, args.userid, args.scenario)

