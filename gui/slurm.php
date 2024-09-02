<?php


function run_aamks($path, $user_id){
    $AAMKS_PATH=getenv('AAMKS_PATH');
    $command = $AAMKS_PATH."/env/bin/python3 ".$AAMKS_PATH."/aamks/slurm.py -t l -p ".$path." -u ".$user_id." 2>&1";
    $output = shell_exec($command);
    return $output;
}
function run_beck_anim($path, $project, $scenario, $iter){
    $AAMKS_PATH=getenv('AAMKS_PATH');
    $command = $AAMKS_PATH.'/env/bin/python3 '.$AAMKS_PATH.'/aamks/slurm.py -t a -p'.$path.' -r '.$project.' -s '.$scenarios.' -i '.$iter;
    $output = shell_exec($command);
    return $output;
}
function run_beck_new($path, $scenarios = ""){
    $AAMKS_PATH=getenv('AAMKS_PATH');
    $command = $AAMKS_PATH.'/env/bin/python3 '.$AAMKS_PATH.'/aamks/slurm.py -t b -p'.$path.' -s '.$scenarios;
    $output = shell_exec($command);
    return $command;
}
function stop($path, $scenario){
    $AAMKS_PATH=getenv('AAMKS_PATH');
    $command = $AAMKS_PATH.'/env/bin/python3 '.$AAMKS_PATH.'/aamks/slurm.py -t d -p '.$path.' -s '.$scenario;
    $output = shell_exec($command);
    return $output;
}
?>
