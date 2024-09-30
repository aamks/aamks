<?php


function run_aamks($path, $user_id){
    $AAMKS_PATH=getenv('AAMKS_PATH');
    $command = $AAMKS_PATH."/env/bin/python3 ".$AAMKS_PATH."/slurm.py -t l -p ".$path." -u ".$user_id." 2>&1";
    $output = shell_exec($command);
    return $output;
}
function run_beck_anim($path, $project, $scenario, $iter){
    $AAMKS_PATH=getenv('AAMKS_PATH');
    $command = $AAMKS_PATH.'/env/bin/python3 '.$AAMKS_PATH.'/slurm.py -t a -p'.$path.' -r '.$project.' -s '.$scenario.' -i '.$iter." 2>&1";
    $output = shell_exec($command);
    return $output;
}
function run_beck_new($path, $scenarios = NULL){
    $AAMKS_PATH=getenv('AAMKS_PATH');
    $command = $AAMKS_PATH.'/env/bin/python3 '.$AAMKS_PATH.'/slurm.py -t p -p'.$path.' -s '.$scenarios.' 2>&1';
    $output = shell_exec($command);
    return $output;
}
function stop($path, $scenario){
    $AAMKS_PATH=getenv('AAMKS_PATH');
    $command = $AAMKS_PATH.'/env/bin/python3 '.$AAMKS_PATH.'/slurm.py -t d -p '.$path.' -s '.$scenario." 2>&1";
    $output = shell_exec($command);
    return $output;
}
?>
