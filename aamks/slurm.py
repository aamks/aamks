import argparse
from simple_slurm import Slurm
import os

from aamks.manager.init import OnInit, OnEnd
from aamks.include import SimIterations, Psql


# launch aamks jobs
def launch(path: str, user_id: int):
    os.environ["AAMKS_PROJECT"] = path
    os.environ["AAMKS_USER_ID"] = user_id
    slaunch = Slurm(partition='aamks-worker', cpus_per_task=1)
    # OnInit loads config, creates iteration sequence, creates directories and insert template records into DB
    oi = OnInit()
    # we use slurm array to quickly batch many jobs
    slaunch.array=range(*oi.irange)
    # res/mgr/aamks prepares simulation files (cfast and evac) and starts worker process afterwards
    slaunch.job_name = f'{oi.project_id}:{oi.scenario_id}'
    try:
        job_id = slaunch.sbatch(f'python {os.path.join(os.environ["AAMKS_PATH"], "aamks.py")} {path} {user_id}', slaunch.SLURM_ARRAY_TASK_ID)
    except AssertionError:
        raise AssertionError("sbatch was unable to launch your jobs. Make sure slurmctld is running and set properly.")
    # log slurm job_id to PSQL (that could be done in PSQL itself with generate_series - to be considered
    for i in range(*oi.irange):
        Psql().query(f"""UPDATE simulations SET job_id='{job_id}_{i}'
                WHERE project={oi.project_id} AND scenario_id={oi.scenario_id} AND iteration={i}""")



# launch postprocessing
def postprocess(path: str, scenarios: str):
    spostprocess = Slurm(partition='aamks-server', cpus_per_task=1)
    try:
        job_id = spostprocess.sbatch(f'python {os.path.join(os.environ["AAMKS_PATH"], "results", "beck_new.py")} {path} {scenarios}')
    except AssertionError:
        raise AssertionError("sbatch was unable to launch your jobs. Make sure slurmctld is running and set properly.")
    return job_id


# prepare animation files
def animation(path: str, project_id: int, scenario_id: id, iteration: int):
    sanimation = Slurm(partition='aamks-server', cpus_per_task=1)
    try:
        job_id = sanimation.sbatch(f'python {os.path.join(os.environ["AAMKS_PATH"], "results", "beck_anim.py")} {path} {project_id} {scenario_id} {iteration}')
    except AssertionError:
        raise AssertionError("sbatch was unable to launch your jobs. Make sure slurmctld is running and set properly.")
    return job_id


# delete jobs
def delete(path: str, user_id: int, scenario_id: str):
    # simple slurm package does not have scancel
    # could be done with Popen() and scancel
    raise Exception("Job deletion is not supported at the moment. Contact your admin to remove jobs.")


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
    parser.add_argument('-s', '--scenario', help='AAMKS scenario ID or scenario names to be compared (see results.beck_new)', required=False, default="")
    parser.add_argument('-i', '--iteration', help='Iteration no.', required=False)

    return parser.parse_args()


if __name__ == '__main__':
    args = _argparse()

    if args.type in ['l', 'launch']:
        if not all([args.path, args.userid]):
            raise Exception('Specify path and userid arguments with -p and -u flags')
        launch(args.path, args.userid)

    elif args.type in ['p', 'pos.postprocess']:
        if not all([args.path]):
            raise Exception('Specify path and scenario (optional) arguments with -p, -u and -s flags')
        postprocess(args.path, args.scenario)

    elif args.type in ['a', 'animation']:
        if not all([args.path, args.project, args.scenario, args.iteration]):
            raise Exception('Specify path, project, scenario and iteration arguments with -p, -r, -s and -i flags')
        animation(args.path, args.project, args.scenario, args.iteration)

    elif args.type in ['d', 'removejobs']:
        if not all([args.path, args.userid, args.scenario]):
            raise Exception('Specify path, userid and scenario arguments with -p, -u and -s flags')
        delete(args.path, args.userid, args.scenario)

