<?php

$redis = new Redis();
$redis->connect(getenv("AAMKS_SERVER"), 6379);
$redis->auth(getenv("AAMKS_REDIS_PASS"));

function push($mess) {
    global $redis;
    $redis->lpush('server_queue', json_encode($mess));
}
function pop() {
    global $redis;
    return $redis->brpop('server_queue');
}
function show(){
    global $redis;
    return $redis->lrange('server_queue', 0, -1);
}
function len(){
    global $redis;
    return $redis->lLen('server_queue');
}
function gen_id(){
    $now = DateTime::createFromFormat('U.u', microtime(true));
    return $now->format("Ymd-H:i:s.u");
}
function message(){
    $message = array(
        "id" => gen_id(), #20231113-15:00:00.000000
        "data" => ''
    );
    return $message;
    // "AA" => array( 
    //     "PROJECT" => getenv("AAMKS_PROJECT"),
    //     "PATH" => getenv("AAMKS_PATH"),
    //     "SERVER" => getenv("AAMKS_SERVER"),
    //     "PG_PASS" => getenv("AAMKS_PG_PASS")),
}
function run_aamks($path, $user_id){
    $mess = message();
    $mess["data"] = array("aamks" => [$path, $user_id]);
    push($mess);
}
function run_beck_anim($path, $project, $scenario, $iter){
    $mess = message();
    $mess["data"] = array("anim" => [$path, $project, $scenario, $iter]);
    push($mess);
}
function run_beck_new($path, $scenarios = ""){
    $mess = message();
    $mess["data"] = array("results" => [$path, $scenarios]);
    push($mess);
}
function run_conf_subst($user_dir, $pid, $sid, $nid, $tid){
    $mess = message();
    $mess["data"] = array("conf_dir" => [$user_dir, $pid, $sid, $nid, $tid]);
    push($mess);
}
function run_activate_email($link, $email){
    $mess = message();
    $mess["data"] = array("activate_email" => [$link, $email]);
    push($mess);
}
function run_reset_email($link, $email){
    $mess = message();
    $mess["data"] = array("reset_email" => [$link, $email]);
    push($mess);
}

?>