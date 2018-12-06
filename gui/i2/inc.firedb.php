<?php
function get_building($q,$get_keys=0) { /*{{{*/
	$db['Hotel']                     =array('code'=> 'c1' , 'hrr_alpha_mode'=> 0.047  , 'hrrpua_mode'=> 500  , 'evacuees_concentration'=> array('ROOM'=>1    , 'COR'=> 1    , 'STAI'=> 1    , 'HALL'=> 1)  ) ;
	$db['Office (closed plan)']      =array('code'=> 'b'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua_mode'=> 500  , 'evacuees_concentration'=> array('ROOM'=>8    , 'COR'=> 20   , 'STAI'=> 50   , 'HALL'=> 30) ) ;
	$db['Office (open plan)']        =array('code'=> 'a'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua_mode'=> 500  , 'evacuees_concentration'=> array('ROOM'=>50   , 'COR'=> 10   , 'STAI'=> 50   , 'HALL'=> 10) ) ;
	$db['Amusement arcade']          =array('code'=> 'b'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua_mode'=> 500  , 'evacuees_concentration'=> array('ROOM'=>0.5  , 'COR'=> 10   , 'STAI'=> 30   , 'HALL'=> 4)  ) ;
	$db['Archive, library']          =array('code'=> 'b'  , 'hrr_alpha_mode'=> 0.047  , 'hrrpua_mode'=> 500  , 'evacuees_concentration'=> array('ROOM'=>5    , 'COR'=> 20   , 'STAI'=> 20   , 'HALL'=> 20) ) ;
	$db['Art gallery']               =array('code'=> 'b'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua_mode'=> 500  , 'evacuees_concentration'=> array('ROOM'=>5    , 'COR'=> 20   , 'STAI'=> 20   , 'HALL'=> 20) ) ;
	$db['Assembly hall']             =array('code'=> 'b'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua_mode'=> 500  , 'evacuees_concentration'=> array('ROOM'=>30   , 'COR'=> 30   , 'STAI'=> 30   , 'HALL'=> 30) ) ;
	$db['Bank']                      =array('code'=> 'b'  , 'hrr_alpha_mode'=> 0.0029 , 'hrrpua_mode'=> 500  , 'evacuees_concentration'=> array('ROOM'=>3    , 'COR'=> 20   , 'STAI'=> 20   , 'HALL'=> 20) ) ;
	$db['Bar']                       =array('code'=> 'b'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua_mode'=> 500  , 'evacuees_concentration'=> array('ROOM'=>0.3  , 'COR'=> 10   , 'STAI'=> 10   , 'HALL'=> 10) ) ;
	$db['Bazaar']                    =array('code'=> 'b'  , 'hrr_alpha_mode'=> 0.047  , 'hrrpua_mode'=> 500  , 'evacuees_concentration'=> array('ROOM'=>2    , 'COR'=> 20   , 'STAI'=> 20   , 'HALL'=> 20) ) ;
	$db['Business centre']           =array('code'=> 'b'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua_mode'=> 500  , 'evacuees_concentration'=> array('ROOM'=>7    , 'COR'=> 20   , 'STAI'=> 20   , 'HALL'=> 20) ) ;
	$db['Canteen']                   =array('code'=> 'a'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua_mode'=> 500  , 'evacuees_concentration'=> array('ROOM'=>1    , 'COR'=> 10   , 'STAI'=> 20   , 'HALL'=> 10) ) ;
	$db['School']                    =array('code'=> 'a'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua_mode'=> 500  , 'evacuees_concentration'=> array('ROOM'=>2    , 'COR'=> 10   , 'STAI'=> 20   , 'HALL'=> 20) ) ;
	$db['Schopping mall']            =array('code'=> 'b'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua_mode'=> 500  , 'evacuees_concentration'=> array('ROOM'=>4    , 'COR'=> 10   , 'STAI'=> 10   , 'HALL'=> 4)  ) ;
	$db['Dance area']                =array('code'=> 'b'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua_mode'=> 500  , 'evacuees_concentration'=> array('ROOM'=>0.5  , 'COR'=> 1    , 'STAI'=> 1    , 'HALL'=> 1)  ) ;
	$db['Dromitory']                 =array('code'=> 'c2' , 'hrr_alpha_mode'=> 0.012  , 'hrrpua_mode'=> 500  , 'evacuees_concentration'=> array('ROOM'=>5    , 'COR'=> 10   , 'STAI'=> 10   , 'HALL'=> 10) ) ;
	$db['Exhibition area']           =array('code'=> 'b'  , 'hrr_alpha_mode'=> 0.047  , 'hrrpua_mode'=> 500  , 'evacuees_concentration'=> array('ROOM'=>1.5  , 'COR'=> 1.5  , 'STAI'=> 10   , 'HALL'=> 1.5)) ;
	$db['Factory area']              =array('code'=> 'a'  , 'hrr_alpha_mode'=> 0.047  , 'hrrpua_mode'=> 500  , 'evacuees_concentration'=> array('ROOM'=>5    , 'COR'=> 10   , 'STAI'=> 20   , 'HALL'=> 10) ) ;
	$db['Gym or leisure centre']     =array('code'=> 'b'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua_mode'=> 500  , 'evacuees_concentration'=> array('ROOM'=>1    , 'COR'=> 1    , 'STAI'=> 1    , 'HALL'=> 1)  ) ;
	$db['Museum']                    =array('code'=> 'b'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua_mode'=> 500  , 'evacuees_concentration'=> array('ROOM'=>0.6  , 'COR'=> 10   , 'STAI'=> 10   , 'HALL'=> 10) ) ;
	$db['Restaurant']                =array('code'=> 'b'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua_mode'=> 500  , 'evacuees_concentration'=> array('ROOM'=>1    , 'COR'=> 10   , 'STAI'=> 10   , 'HALL'=> 10) ) ;
	$db['Shop sales']                =array('code'=> 'b'  , 'hrr_alpha_mode'=> 0.047  , 'hrrpua_mode'=> 500  , 'evacuees_concentration'=> array('ROOM'=>2    , 'COR'=> 5    , 'STAI'=> 10   , 'HALL'=> 2)  ) ;
	$db['Storage or warehousing']    =array('code'=> 'a'  , 'hrr_alpha_mode'=> 0.18   , 'hrrpua_mode'=> 500  , 'evacuees_concentration'=> array('ROOM'=>30   , 'COR'=> 30   , 'STAI'=> 30   , 'HALL'=> 30) ) ;
	$db['Theatre, concert hall']     =array('code'=> 'b'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua_mode'=> 500  , 'evacuees_concentration'=> array('ROOM'=>0.4  , 'COR'=> 10   , 'STAI'=> 10   , 'HALL'=> 10) ) ;
	$db['Medical day centre']        =array('code'=> 'd1' , 'hrr_alpha_mode'=> 0.012  , 'hrrpua_mode'=> 500  , 'evacuees_concentration'=> array('ROOM'=>7    , 'COR'=> 10   , 'STAI'=> 10   , 'HALL'=> 10) ) ;
	$db['Hospital, nursing home']    =array('code'=> 'd2' , 'hrr_alpha_mode'=> 0.012  , 'hrrpua_mode'=> 500  , 'evacuees_concentration'=> array('ROOM'=>10   , 'COR'=> 20   , 'STAI'=> 20   , 'HALL'=> 20) ) ;
	$db['Railway station, airport']  =array('code'=> 'e'  , 'hrr_alpha_mode'=> 0.012  , 'hrrpua_mode'=> 500  , 'evacuees_concentration'=> array('ROOM'=>2    , 'COR'=> 10   , 'STAI'=> 10   , 'HALL'=> 10) ) ;
	if(empty($get_keys)) {  
		if(isset($db[$q])) { 
			return $db[$q];
		} else {
			return array('code'=>'', 'hrr_alpha_mode'=> '', 'hrrpua_mode'=> '', 'evacuees_concentration'=> array('ROOM'=>'', 'COR'=> '', 'STAI'=> '', 'HALL'=> '') ) ;
		}
	} else {
		return array_keys($db);
	}
}
/*}}}*/
function get_profile_code($q) { #{{{
	$db['a,fire_origin']  = [29.85,1.48];
	$db['a,M1,B1,A1']     = [29.71,2.96];
	$db['a,M1,B1,A2']     = [29.71,2.96];
	$db['a,M1,B1,A3']     = [];
	$db['a,M1,B2,A1']     = [29.71,2.96];
	$db['a,M1,B2,A2']     = [29.71,2.96];
	$db['a,M1,B2,A3']     = [];
	$db['a,M1,B3,A1']     = [59.71,2.96];
	$db['a,M1,B3,A2']     = [59.71,2.96];
	$db['a,M1,B3,A3']     = [];
	$db['a,M2,B1,A1']     = [59.42,5.92];
	$db['a,M2,B1,A2']     = [59.42,5.92];
	$db['a,M2,B1,A3']     = [];
	$db['a,M2,B2,A1']     = [59.42,5.92];
	$db['a,M2,B2,A2']     = [59.42,5.92];
	$db['a,M2,B2,A3']     = [];
	$db['a,M2,B3,A1']     = [89.42,5.92];
	$db['a,M2,B3,A2']     = [89.42,5.92];
	$db['a,M2,B3,A3']     = [];
	$db['a,M3,B1,A1']     = [899.42,5.92];
	$db['a,M3,B1,A2']     = [899.42,5.92];
	$db['a,M3,B1,A3']     = [];
	$db['a,M3,B2,A1']     = [899.42,5.92];
	$db['a,M3,B2,A2']     = [899.42,5.92];
	$db['a,M3,B2,A3']     = [];
	$db['a,M3,B3,A1']     = [929.42,5.92];
	$db['a,M3,B3,A2']     = [929.42,5.92];
	$db['a,M3,B3,A3']     = [929.42,5.92];
	$db['b,fire_origin']  = [59.85,1.48];
	$db['b,M1,B1,A1']     = [29.13,8.87];
	$db['b,M1,B1,A2']     = [29.13,8.87];
	$db['b,M1,B1,A3']     = [];
	$db['b,M1,B2,A1']     = [59.13,8.87];
	$db['b,M1,B2,A2']     = [59.13,8.87];
	$db['b,M1,B2,A3']     = [];
	$db['b,M1,B3,A1']     = [89.13,8.87];
	$db['b,M1,B3,A2']     = [89.13,8.87];
	$db['b,M1,B3,A3']     = [];
	$db['b,M2,B1,A1']     = [58.84,11.83];
	$db['b,M2,B1,A2']     = [58.84,11.83];
	$db['b,M2,B1,A3']     = [];
	$db['b,M2,B2,A1']     = [88.84,11.83];
	$db['b,M2,B2,A2']     = [88.84,11.83];
	$db['b,M2,B2,A3']     = [];
	$db['b,M2,B3,A1']     = [118.84,11.83];
	$db['b,M2,B3,A2']     = [118.84,11.83];
	$db['b,M2,B3,A3']     = [];
	$db['b,M3,B1,A1']     = [899.42,5.92];
	$db['b,M3,B1,A2']     = [899.42,5.92];
	$db['b,M3,B1,A3']     = [];
	$db['b,M3,B2,A1']     = [899.42,5.92];
	$db['b,M3,B2,A2']     = [899.42,5.92];
	$db['b,M3,B2,A3']     = [];
	$db['b,M3,B3,A1']     = [929.42,5.92];
	$db['b,M3,B3,A2']     = [929.42,5.92];
	$db['b,M3,B3,A3']     = [929.42,5.92];
	$db['c1,fire_origin'] = [59.85,1.48];
	$db['c1,M1,B1,A1']    = [29.71,2.96];
	$db['c1,M1,B1,A2']    = [29.71,2.96];
	$db['c1,M1,B1,A3']    = [];
	$db['c1,M1,B2,A1']    = [594.22,59.16];
	$db['c1,M1,B2,A2']    = [594.22,59.16];
	$db['c1,M1,B2,A3']    = [];
	$db['c1,M1,B3,A1']    = [59.71,2.96];
	$db['c1,M1,B3,A2']    = [59.71,2.96];
	$db['c1,M1,B3,A3']    = [];
	$db['c1,M2,B1,A1']    = [299.94,0.59];
	$db['c1,M2,B1,A2']    = [];
	$db['c1,M2,B1,A3']    = [];
	$db['c1,M2,B2,A1']    = [894.22,59.16];
	$db['c1,M2,B2,A2']    = [894.22,59.16];
	$db['c1,M2,B2,A3']    = [];
	$db['c1,M2,B3,A1']    = [];
	$db['c1,M2,B3,A2']    = [];
	$db['c1,M2,B3,A3']    = [];
	$db['c1,M3,B1,A1']    = [];
	$db['c1,M3,B1,A2']    = [];
	$db['c1,M3,B1,A3']    = [594.22,59.16];
	$db['c1,M3,B2,A1']    = [1199.94,0.59];
	$db['c1,M3,B2,A2']    = [1199.94,0.59];
	$db['c1,M3,B2,A3']    = [1199.94,0.59];
	$db['c1,M3,B3,A1']    = [];
	$db['c1,M3,B3,A2']    = [];
	$db['c1,M3,B3,A3']    = [];
	$db['c2,fire_origin'] = [59.85,1.48];
	$db['c2,M1,B1,A1']    = [29.71,2.96];
	$db['c2,M1,B1,A2']    = [29.71,2.96];
	$db['c2,M1,B1,A3']    = [];
	$db['c2,M1,B2,A1']    = [594.22,59.16];
	$db['c2,M1,B2,A2']    = [594.22,59.16];
	$db['c2,M1,B2,A3']    = [];
	$db['c2,M1,B3,A1']    = [59.71,2.96];
	$db['c2,M1,B3,A2']    = [59.71,2.96];
	$db['c2,M1,B3,A3']    = [];
	$db['c2,M2,B1,A1']    = [299.94,0.59];
	$db['c2,M2,B1,A2']    = [];
	$db['c2,M2,B1,A3']    = [];
	$db['c2,M2,B2,A1']    = [894.22,59.16];
	$db['c2,M2,B2,A2']    = [894.22,59.16];
	$db['c2,M2,B2,A3']    = [];
	$db['c2,M2,B3,A1']    = [];
	$db['c2,M2,B3,A2']    = [];
	$db['c2,M2,B3,A3']    = [];
	$db['c2,M3,B1,A1']    = [];
	$db['c2,M3,B1,A2']    = [];
	$db['c2,M3,B1,A3']    = [594.22,59.16];
	$db['c2,M3,B2,A1']    = [1199.94,0.59];
	$db['c2,M3,B2,A2']    = [1199.94,0.59];
	$db['c2,M3,B2,A3']    = [1199.94,0.59];
	$db['c2,M3,B3,A1']    = [];
	$db['c2,M3,B3,A2']    = [];
	$db['c2,M3,B3,A3']    = [];
	$db['c3,fire_origin'] = [59.85,1.48];
	$db['c3,M1,B1,A1']    = [29.71,2.96];
	$db['c3,M1,B1,A2']    = [29.71,2.96];
	$db['c3,M1,B1,A3']    = [];
	$db['c3,M1,B2,A1']    = [594.22,59.16];
	$db['c3,M1,B2,A2']    = [594.22,59.16];
	$db['c3,M1,B2,A3']    = [];
	$db['c3,M1,B3,A1']    = [59.71,2.96];
	$db['c3,M1,B3,A2']    = [59.71,2.96];
	$db['c3,M1,B3,A3']    = [];
	$db['c3,M2,B1,A1']    = [299.94,0.59];
	$db['c3,M2,B1,A2']    = [];
	$db['c3,M2,B1,A3']    = [];
	$db['c3,M2,B2,A1']    = [894.22,59.16];
	$db['c3,M2,B2,A2']    = [894.22,59.16];
	$db['c3,M2,B2,A3']    = [];
	$db['c3,M2,B3,A1']    = [];
	$db['c3,M2,B3,A2']    = [];
	$db['c3,M2,B3,A3']    = [];
	$db['c3,M3,B1,A1']    = [];
	$db['c3,M3,B1,A2']    = [];
	$db['c3,M3,B1,A3']    = [594.22,59.16];
	$db['c3,M3,B2,A1']    = [1199.94,0.59];
	$db['c3,M3,B2,A2']    = [1199.94,0.59];
	$db['c3,M3,B2,A3']    = [1199.94,0.59];
	$db['c3,M3,B3,A1']    = [];
	$db['c3,M3,B3,A2']    = [];
	$db['c3,M3,B3,A3']    = [];
	$db['d1,fire_origin'] = [59.85,1.48];
	$db['d1,M1,B1,A1']    = [28.84,11.83];
	$db['d1,M1,B1,A2']    = [28.84,11.83];
	$db['d1,M1,B1,A3']    = [];
	$db['d1,M1,B2,A1']    = [59.13,8.87];
	$db['d1,M1,B2,A2']    = [59.13,8.87];
	$db['d1,M1,B2,A3']    = [];
	$db['d1,M1,B3,A1']    = [89.13,8.87];
	$db['d1,M1,B3,A2']    = [89.13,8.87];
	$db['d1,M1,B3,A3']    = [];
	$db['d1,M2,B1,A1']    = [58.84,11.83];
	$db['d1,M2,B1,A2']    = [58.84,11.83];
	$db['d1,M2,B1,A3']    = [];
	$db['d1,M2,B2,A1']    = [894.22,59.16];
	$db['d1,M2,B2,A2']    = [894.22,59.16];
	$db['d1,M2,B2,A3']    = [];
	$db['d1,M2,B3,A1']    = [];
	$db['d1,M2,B3,A2']    = [];
	$db['d1,M2,B3,A3']    = [];
	$db['d1,M3,B1,A1']    = [899.94,0.59];
	$db['d1,M3,B1,A2']    = [899.94,0.59];
	$db['d1,M3,B1,A3']    = [899.94,0.59];
	$db['d1,M3,B2,A1']    = [1199.94,0.59];
	$db['d1,M3,B2,A2']    = [1199.94,0.59];
	$db['d1,M3,B2,A3']    = [1199.94,0.59];
	$db['d1,M3,B3,A1']    = [1259.94,0.59];
	$db['d1,M3,B3,A2']    = [1259.94,0.59];
	$db['d1,M3,B3,A3']    = [1259.94,0.59];
	$db['d2,fire_origin'] = [59.85,1.48];
	$db['d2,M1,B1,A1']    = [];
	$db['d2,M1,B1,A2']    = [];
	$db['d2,M1,B1,A3']    = [];
	$db['d2,M1,B2,A1']    = [297.11,29.56];
	$db['d2,M1,B2,A2']    = [297.11,29.56];
	$db['d2,M1,B2,A3']    = [];
	$db['d2,M1,B3,A1']    = [357.11,29.58];
	$db['d2,M1,B3,A2']    = [357.11,29.58];
	$db['d2,M1,B3,A3']    = [];
	$db['d2,M2,B1,A1']    = [];
	$db['d2,M2,B1,A2']    = [];
	$db['d2,M2,B1,A3']    = [];
	$db['d2,M2,B2,A1']    = [594.22,59.16];
	$db['d2,M2,B2,A2']    = [594.22,59.16];
	$db['d2,M2,B2,A3']    = [];
	$db['d2,M2,B3,A1']    = [654.22,59.16];
	$db['d2,M2,B3,A2']    = [654.22,59.16];
	$db['d2,M2,B3,A3']    = [];
	$db['d2,M3,B1,A1']    = [];
	$db['d2,M3,B1,A2']    = [];
	$db['d2,M3,B1,A3']    = [];
	$db['d2,M3,B2,A1']    = [594.22,59.16];
	$db['d2,M3,B2,A2']    = [594.22,59.16];
	$db['d2,M3,B2,A3']    = [];
	$db['d2,M3,B3,A1']    = [654.22,59.16];
	$db['d2,M3,B3,A2']    = [654.22,59.16];
	$db['d2,M3,B3,A3']    = [654.22,59.16];
	$db['e,fire_origin']  = [59.85,1.48];
	$db['e,M1,B1,A1']     = [];
	$db['e,M1,B1,A2']     = [];
	$db['e,M1,B1,A3']     = [];
	$db['e,M1,B2,A1']     = [];
	$db['e,M1,B2,A2']     = [];
	$db['e,M1,B2,A3']     = [];
	$db['e,M1,B3,A1']     = [88.56,14.79];
	$db['e,M1,B3,A2']     = [88.56,14.79];
	$db['e,M1,B3,A3']     = [];
	$db['e,M2,B1,A1']     = [];
	$db['e,M2,B1,A2']     = [];
	$db['e,M2,B1,A3']     = [];
	$db['e,M2,B2,A1']     = [];
	$db['e,M2,B2,A2']     = [];
	$db['e,M2,B2,A3']     = [];
	$db['e,M2,B3,A1']     = [118.27,17.75];
	$db['e,M2,B3,A2']     = [118.27,17.75];
	$db['e,M2,B3,A3']     = [];
	$db['e,M3,B1,A1']     = [];
	$db['e,M3,B1,A2']     = [];
	$db['e,M3,B1,A3']     = [];
	$db['e,M3,B2,A1']     = [];
	$db['e,M3,B2,A2']     = [];
	$db['e,M3,B2,A3']     = [];
	$db['e,M3,B3,A1']     = [899.94,0.59];
	$db['e,M3,B3,A2']     = [899.94,0.59];
	$db['e,M3,B3,A3']     = [899.94,0.59];

	if(isset($db[$q][0])) { 
		return array("mean"=>$db[$q][0], "sd"=>$db[$q][1]);
	} else {
		return array("mean"=>"", "sd"=>"");
	}
}
/*}}}*/
function get_defaults($q) {/*{{{*/
	// setups may be later mapped to countries

	$db['setup1']='
	{
		"outdoor_temperature": { "min": 100, "max": 1000 },
		"indoor_pressure": 101325,
		"windows": [ 
			{ "min": -99999 , "max": -5    , "quarter": -5 , "full": 0.11 } ,
			{ "min": -5     , "max": 15    , "quarter": 0  , "full": 0.5 }  ,
			{ "min": 15     , "max": 27    , "quarter": 0  , "full": 0.5 }  ,
			{ "min": 27     , "max": 99999 , "quarter": 0  , "full": 0.5 }
		], 
		"doors": { "E": 0.04, "C": 0.14, "D": 0.5 },
		"vvents_not_broken": 0.96,
		"c_const": 8,
		"evacuees_max_h_speed" : { "mean" : 120    , "sd" : 20 },
		"evacuees_max_v_speed" : { "mean" : 80     , "sd" : 20 },
		"evacuees_alpha_v"     : { "mean" : 0.706  , "sd" : 0.069 },
		"evacuees_beta_v"      : { "mean" : -0.057 , "sd" : 0.015 },
		"fire_starts_in_a_room"  : 0.8,

		"hrrpua":	 { "min": 300    , "mode": 1000  , "max": 1300 },
		"hrr_alpha": { "min": 0.0029 , "mode": 0.047 , "max": 0.188 },
		"evacuees_concentration": { "COR": 20 , "STAI": 50 , "ROOM": 8  , "HALL": 30 } 
	}';

	return json_decode($db[$q],1);
}
/*}}}*/
?>
