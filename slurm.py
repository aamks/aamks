import argparse
from simple_slurm import Slurm
import os
import ast

from include import Psql, Json

def_args = [
        '--ntasks', 1,
        '--ntasks_per_core', 1,
        ]
python_env_aamks = f'{os.path.join(os.environ["AAMKS_PATH"], "env", "bin", "python")}'

# launch aamks jobs
def launch(path: str, user_id: str, irange: str):
    os.environ["AAMKS_PROJECT"] = path
    os.environ["AAMKS_USER_ID"] = int(user_id)
    irange = ast.literal_eval(irange)
    conf = Json().read("{}/conf.json".format(os.environ['AAMKS_PROJECT']))
    p_id = conf['project_id']
    s_id = conf['scenario_id']

    # initiate slurm wrapper
    slurm = Slurm()
    slurm.add_arguments(*def_args)
    slurm.set_partition('aamks-worker')
    slurm.set_account(f'aamks-{user_id}')
    slurm.set_chdir(path)
    slurm.set_output(f'workers/%a/slurm.out')
    slurm.set_error(f'workers/%a/slurm.err')
    slurm.set_time('01:00:00')

    # instead of default loop in aamks.py we use slurm array to quickly batch many jobs
    slurm.set_array(range(*irange))

    # aamks.py prepares simulation files (cfast and evac) and starts worker process afterwards
    # with slurm those tasks are performed for each iteration separately
    slurm.job_name = f'{p_id}:{s_id}'
    command = f'srun {python_env_aamks} {os.path.join(os.environ["AAMKS_PATH"], "aamks.py")} {path} {user_id}'
    try:
        job_id = slurm.sbatch(command, slurm.SLURM_ARRAY_TASK_ID)
    except AssertionError:
        raise AssertionError("sbatch was unable to launch your jobs. Make sure slurm is running and set properly.")

# launch postprocessing
def postprocess(path: str, scenarios: list):
    # initiate slurm wrapper
    slurm = Slurm()
    slurm.add_arguments(*def_args)
    slurm.set_partition('aamks-server')
    slurm.set_account('aamks')
    slurm.set_chdir(path)
    slurm.set_output(f'slurm_pp.out')
    slurm.set_error(f'slurm_pp.err')

    # add a job to priority aamks-server partition
    command = f'{python_env_aamks} {os.path.join(os.environ["AAMKS_PATH"], "results", "beck_new.py")} {path} {" ".join(scenarios)}'
    print(slurm)
    print(command)
    try:
        job_id = slurm.sbatch(command)
    except AssertionError:
        raise AssertionError("sbatch was unable to launch your jobs. Make sure slurm is running and set properly.")
    return job_id


# prepare animation files
def animation(path: str, project_id: int, scenario_id: int, iteration: int):
    # initiate slurm wrapper
    slurm = Slurm()
    slurm.add_arguments(*def_args)
    slurm.set_partition('aamks-server')
    slurm.set_account('aamks')
    slurm.set_chdir(path)
    slurm.set_output(f'slurm_a.out')
    slurm.set_error(f'slurm_a.err')

    # add a job to priority aamks-server partition
    command = f'{python_env_aamks} {os.path.join(os.environ["AAMKS_PATH"], "results", "beck_anim.py")} {path} {project_id} {scenario_id} {iteration}'
    try:
        job_id = slurm.sbatch(command)
    except AssertionError:
        raise AssertionError("sbatch was unable to launch your jobs. Make sure slurm is running and set properly.")
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
    parser.add_argument('-s', '--scenario', nargs='*', help='AAMKS scenario ID or scenario names to be compared (see results.beck_new)', required=False, default=[])
    parser.add_argument('-i', '--iteration', help='Iteration no.', required=False)
    parser.add_argument('-n', '--number', help='Range of iterations to run numbers [start, end]', required=False)

    return parser.parse_args()


if __name__ == '__main__':
    args = _argparse()

    if args.type in ['l', 'launch']:
        if not all([args.path, args.userid, args.number]):
            raise Exception('Specify path, userid and range of iterations numbers arguments with -p, -u and -n flags')
        launch(args.path, args.userid, args.number)

    elif args.type in ['p', 'pos.postprocess']:
        if not all([args.path]):
            raise Exception('Specify path and scenario (optional) arguments with -p, -u and -s flags')
        postprocess(args.path, args.scenario)

    elif args.type in ['a', 'animation']:
        if not all([args.path, args.project, args.scenario, args.iteration]):
            raise Exception('Specify path, project, scenario and iteration arguments with -p, -r, -s and -i flags')
        animation(args.path, args.project, int(args.scenario[0]), args.iteration)

    elif args.type in ['d', 'removejobs']:
        if not all([args.path, args.userid, args.scenario]):
            raise Exception('Specify path, userid and scenario arguments with -p, -u and -s flags')
        delete(args.path, args.userid, args.scenario)

