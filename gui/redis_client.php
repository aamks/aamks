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
}
function run_aamks($path, $user_id, $irange){
    $mess = message();
    $mess["data"] = array("aamks" => [$path, $user_id, $irange]);
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

function delete_from_redis($redis, $id){ 
    $element_id_to_remove = $id;
    $redis_queue_key = 'aamks_queue';
    $elements = $redis->lrange($redis_queue_key, 0, -1);
    foreach ($elements as $element) {
        $decoded_element = json_decode($element, true);
        if ($decoded_element['id'] == $element_id_to_remove) {
            // delete element from DB
            $redis->lrem($redis_queue_key, $element, 0);
            break; 
        }
    }
}

?>
