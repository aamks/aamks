<?php

class MasterFDS {
	public $atoms;
	public function __construct($raw){
		$this->rawContent=explode(PHP_EOL, $raw);
		$this->collectMsgErrors=[];
		$this->collectMsgInfos=[];
		$this->collectData=[];
	}

	private function returnPodsumowanie($category) {/*{{{*/
		if(!empty($this->collectData))		   { $data=join("\n", $this->collectData)."\n"; } else { $data=''; }
		if(!empty($this->collectMsgErrors))    { return array('meta'=>array( 'status'=>'fatal'   , 'from'=>"$category"."()" , 'details'=>$this->collectMsgErrors) ,  'data'=>$data, 'mimoohDebugRawContent'=>$this->rawContent); }
		elseif(!empty($this->collectMsgInfos)) { return array('meta'=>array( 'status'=>'success' , 'from'=>"$category"."()" , 'details'=>$this->collectMsgInfos  ) , 'data'=>$data, 'mimoohDebugRawContent'=>$this->rawContent); }
		else                                   { return array('meta'=>array( 'status'=>'success' , 'from'=>"$category"."()" , 'details'=>''                      ) , 'data'=>$data, 'mimoohDebugRawContent'=>$this->rawContent); }
	}
/*}}}*/
	private function arr2fdsRecord($arr) {/*{{{*/
		if(isset($arr['comment'])) { $comment=$arr['comment']; unset($arr['comment']); } else { $comment=''; }
		$amper=$arr['amper']; 
		unset($arr['amper']);
		unset($arr['tag']);
		unset($arr['rawLine']);
		unset($arr['rawLineNo']);

		foreach($arr as $k=>$v) {
			if($k=='rampLikeTvsFproblem') {  
				unset($arr['rampLikeTvsFproblem']);
				$arr[]=preg_replace('/:/', '=', $v); 
			} else {
				$arr[$k]="$k=$v";
			}
		}
		$record="$amper ".join(", ", $arr)." / "."$comment\n";
		return "$record";
	}


/*}}}*/
	private function arr2fdsRecordNoSpacesNoComments($arr) {/*{{{*/
		$amper=$arr['amper']; unset($arr['amper']);
		unset($arr['tag']);
		unset($arr['comment']);

		foreach($arr as $k=>$v) {
			$arr[$k]="$k=$v";
		}
		$record="$amper".join('',$arr);
		$record=preg_replace("/[\s,]/", '', $record);
		return "$record";
	}


/*}}}*/
	private function rawContentIntoCommandsArray() {/*{{{*/
		$arr=$this->rawContent;
		$cmds=[];

		foreach($arr as $k=>$v) {
			if($k==0 && !preg_match("/^\s*&/", $v)) { 
				$i=$k+1;
				$cmds[$i]="$v";
				continue;
			}
			if(preg_match("/^\s*&/", $v)) {
				$i=$k+1;
				$cmds[$i]="$v";
				continue;
			}
			$cmds[$i].="$v";
		}

		foreach($cmds as $nu=>$cmd) { 
			if (preg_match('/^\s*&/', $cmd) && !preg_match("/\//", $cmd)) { $this->collectMsgErrors[$nu][]="Missing ending slash"; }
		}
		$this->fdsRawCmdsArr=$cmds;
		#dd($cmds,'cmds');
	}


/*}}}*/
	private function preventAttribsOverwriteLines($atoms) {/*{{{*/
		# rampLikeTvsFproblem to wyjatek dla sytuacji gdzie nie mozna uzyc kluczy:
		# &RAMP T=1,F=2,T=3,F=4,T=5,F=6
		# robimy tak
		# &RAMP rampLikeTvsFproblem='T:1,F:2,T:3,F:4,T:5,F:6'
		$out=[];
		if($atoms[0]=='&RAMP') {
			unset($atoms[0]);
			$out[]='&RAMP';
			$out[1]="rampLikeTvsFproblem=";
			foreach($atoms as $v) {
				if(preg_match('/^T=/', $v)) { $out[1].=preg_replace('/=/', ':', "$v").' '; }
				elseif(preg_match('/^F=/', $v)) { $out[1].=preg_replace('/=/', ':', "$v").' '; }
				else { $out[]=$v; }
			}
			return $out;
		}
		return $atoms;
	}
/*}}}*/
	private function fds2atoms() {/*{{{*/

		$out=[];
		$arr=$this->fdsRawCmdsArr;
		foreach($arr as $numer=>$line) {
			$checkDuplicates=[];
			$origLine=$line;

			$line=preg_replace("/\r*\n*/", '', $line); 
			$line=preg_replace("/\s*=\s*/", '=', $line); 
			$line=preg_replace("/#/", '', $line); 
			if(!preg_match("/\/\s*$/", $line)) { $line=preg_replace("/\//", "/ #", $line); }

			$atoms=preg_split("/\s+/", $line);
			$atoms=$this->preventAttribsOverwriteLines($atoms);
			$record=[];
			$record[]=array('key'=>'amper', 'val'=>array_shift($atoms));
			$cursor=0;
			for($i=0; $i<count($atoms); $i++) { 
				if(preg_match("/\//", $atoms[$i])) { continue; } 

				elseif(preg_match("/#/", $atoms[$i])) { 
					$cursor++;
					$record[$cursor]=array('key'=>'comment', 'val'=>'#');
				}
				elseif(preg_match("/=/", $atoms[$i])) { 
					$left=preg_replace("/=.*/", '', $atoms[$i]);
					$right=preg_replace("/.*=/", '', $atoms[$i]);
					$cursor++;
					$record[$cursor]=array('key'=>$left, 'val'=>$right);
					$checkDuplicates[]=$left;
				}
				else { 
					$record[$cursor]['val'].=" ".$atoms[$i]; 
				}
			}
			$atomizedArray=[];
			foreach($record as $k=>$v) {
				extract($v);
				$atomizedArray[$key]=preg_replace("/,$/", "", rtrim($val));
			}
			$atomizedArray['rawLineNo']=$numer;
			$atomizedArray['rawLine']=$origLine;
			$out[]=$atomizedArray;
			$this->makeDuplicatesCheck($checkDuplicates, $numer);
		}
		$this->atoms=$out;

	}
	private function makeDuplicatesCheck($arr,$nu) {/*{{{*/
		$seen=[];
		foreach($arr as $i) {
			if(in_array($i, $seen)) { $this->collectMsgErrors[$nu][]="$i appears more than once."; }
			$seen[]=$i;
		}
	}
/*}}}*/


/*}}}*/
	private function validateAtoms() {/*{{{*/
		#dd2($this->atoms);
		require_once("fdsEntitiesDB.php");  # fdsEntities, fdsObsolete
		foreach($this->atoms as $arr) {
			$amper=$arr['amper']; unset($arr['amper']);
			foreach($arr as $k=>$v) {
				$k=preg_replace("/\(.*/", '', $k); # MATL_ID(2,3) na MATL_ID
				#if($k!='comment' and ! in_array($k, array('tag','rawLineNo', 'rawLine', 'rampLikeTvsFproblem')) and isset($this->fdsEntities[$amper])) { 
				if(!in_array($k, array('FYI','comment','tag','rawLineNo', 'rawLine', 'rampLikeTvsFproblem')) and isset($fdsEntities[$amper])) { 
					if(!in_array($k,array_keys($fdsEntities[$amper]))) { 
						$nu=$arr['rawLineNo'];
						$this->collectMsgErrors[$nu][]="$k is not a valid attribute of $amper."; 
						if(in_array($amper, array_keys($fdsObsolete))) { 
							if(isset($fdsObsolete[$amper][$k])) { $this->collectMsgErrors[$nu][]="$k is obsolete and should be replaced with: ".$fdsObsolete[$amper][$k]; }
						}
					}
				}
			}
		}
	}

/*}}}*/
	private function validateStructure() {/*{{{*/
		foreach($this->atoms as $arr) {
			$err='';
			$amper=$arr['amper']; 
			$line=$this->arr2fdsRecordNoSpacesNoComments($arr);
			if (($amper=='&VENT') and (!isset($arr['SURF_ID']))) { $err.='&VENT requires SURF_ID.'; }
			if (($amper=='&SURF') and (!isset($arr['ID'])))      { $err.='&SURF requires ID.'; }
			if (($amper=='&RAMP') and (!isset($arr['ID'])))      { $err.='&RAMP requires ID.'; }

			if (!empty($err)) {
				$nu=$arr['rawLineNo'];
				$this->collectMsgErrors[$nu][]="$err";
			}
		}
	}
	

/*}}}*/
	private function makeSurfsMatlsFriends() {/*{{{*/
		$this->surfsMatlsFriends=[];

		# &MATL database
		$this->surfsMatlsFriends['&MATL']=[];
		foreach($this->atoms as $arr) {
			if($arr['amper']=='&MATL' && !in_array($arr['ID'], $this->surfsMatlsFriends['&MATL'])) {
				if(isset($arr['DENSITY']) or isset($arr['CONDUCTIVITY'])) { 
						$this->surfsMatlsFriends['&MATL'][$arr['ID']]='GEOMETRY'; 
				} 
			}
		}

		# &DEVC database
		$this->surfsMatlsFriends['&DEVC']=[];
		foreach($this->atoms as $arr) {
			if($arr['amper']=='&OBST' && isset($arr['DEVC_ID']) && !in_array($arr['DEVC_ID'], $this->surfsMatlsFriends['&DEVC'])) {
					$n=preg_replace("/'/", '', $arr['DEVC_ID']); 
					$this->surfsMatlsFriends['&DEVC'][$arr['DEVC_ID']]='CONTROL_'."$n"; 
			}
		}

		# &SURF and &RAMP database
		$this->surfsMatlsFriends['&SURF']=[];
		$this->surfsMatlsFriends['&RAMP']=[];
		foreach($this->atoms as $arr) {
			if($arr['amper']=='&SURF' && !in_array($arr['ID'], $this->surfsMatlsFriends['&SURF'])) {
				if(isset($arr['RAMP_Q'])) { 
							$n=preg_replace("/'/", '', $arr['ID']); 
							$this->surfsMatlsFriends['&RAMP'][$arr['RAMP_Q']]='FIRE_'."$n"; 
				}
				if(isset($arr['RAMP_V'])) { 
							$n=preg_replace("/'/", '', $arr['ID']); 
							$this->surfsMatlsFriends['&RAMP'][$arr['RAMP_V']]='HVAC_'."$n"; 
				}
				if(isset($arr['HRRPUA']) or isset($arr['MLRPUA']) or isset($arr['TMP_FRONT']) or isset($arr['SPREAD_RATE'])) { 
							$n=preg_replace("/'/", '', $arr['ID']); 
							$this->surfsMatlsFriends['&SURF'][$arr['ID']]='FIRE_'."$n"; 
				}
				elseif (isset($arr['VOLUME_FLOW']) or isset($arr['RAMP_V'])) { 
							$n=preg_replace("/'/", '', $arr['ID']); 
							$this->surfsMatlsFriends['&SURF'][$arr['ID']]='HVAC_'."$n"; 
				}
				else { $this->tagSurfBasedOnMatlID($arr); }																
			}
		}
	}
	private function tagSurfBasedOnMatlID($arr) {
		foreach($arr as $k=>$v) {
			if(preg_match('/MATL_ID/', $k)) { 
				$allMatls=explode(',',$v);
				$matlID="$allMatls[0]";
				if ($this->surfsMatlsFriends['&MATL'][$matlID]=='GEOMETRY')  {
					$n=preg_replace("/'/", '', $arr['ID']); 
					$this->surfsMatlsFriends['&SURF'][$arr['ID']]='GEOMETRY_'."$n"; 
				}
			}
		}
	}

/*}}}*/
	private function makeTags() {/*{{{*/
		foreach($this->atoms as $k=>$arr) {
			$addTag='';
			$amper=$arr['amper'];

			# ROZNOSCI
			if ($amper=='&HEAD')     { $addTag='GENERAL_HEAD'; }
			elseif ($amper=='&BNDF') { $addTag='RESULTS_BNDF'; }
			elseif ($amper=='&CLIP') { $addTag='GENERAL_CLIP'; }
			elseif ($amper=='&DUMP') { $addTag='GENERAL_DUMP'; }
			elseif ($amper=='&HOLE') { $addTag='GEOMETRY_HOLE'; }
			elseif ($amper=='&INIT') { $addTag='GENERAL_INIT'; }
			elseif ($amper=='&ISOF') { $addTag='RESULTS_ISOF'; }
			elseif ($amper=='&MISC') { $addTag='GENERAL_MISC'; }
			elseif ($amper=='&MULT') { $addTag='GEOMETRY_MULT'; }
			elseif ($amper=='&PART') { $addTag='PARTICLES_PART'; }
			elseif ($amper=='&PRES') { $addTag='GENERAL_PRES'; }
			elseif ($amper=='&RADI') { $addTag='FIRE_RADI'; }
			elseif ($amper=='&REAC') { $addTag='FIRE00_REAC'; }
			elseif ($amper=='&SLCF') { $addTag='RESULTS_SLCF'; }
			elseif ($amper=='&TAIL') { $addTag='GENERAL_TAIL'; }
			elseif ($amper=='&TIME') { $addTag='GENERAL_TIME'; }
			elseif ($amper=='&TRNX') { $addTag='GEOMETRY_TRNX'; }
			elseif ($amper=='&TRNY') { $addTag='GEOMETRY_TRNY'; }
			elseif ($amper=='&TRNZ') { $addTag='GEOMETRY_TRNZ'; }

			# PROF
			elseif (($amper=='&PROF') and ( isset($arr['QUANTITY']))) { $addTag='RESULTS_PROF'; }

			# DEVC
			elseif ($amper=='&DEVC') { 
				if (isset($this->surfsMatlsFriends['&DEVC'][$arr['ID']])) {  $addTag=$this->surfsMatlsFriends['&DEVC'][$arr['ID']].'_DEVC'; } 
				elseif (isset($arr['QUANTITY'])) { $addTag='RESULTS_DEVC'; }
				elseif (isset($arr['PART_ID']))  { $addTag='PARTICLES_DEVC'; }
			}

			# MESH
			elseif ($amper=='&MESH') { $addTag='MESH_MESH'; }

			# OBST
			elseif (($amper=='&OBST') and ( isset($arr['DEVC_ID'])))  { $n=preg_replace("/'/", '', $arr['DEVC_ID']);  $addTag="CONTROL_${n}_OBST"; }
			elseif ($amper=='&OBST') { $addTag='GEOMETRY_OBST'; }

			# SURF
			elseif ($amper=='&SURF') { $addTag=$this->surfsMatlsFriends['&SURF'][$arr['ID']]."_0SURF"; }

			# MATL
			elseif (($amper=='&MATL') and ( isset($arr['DENSITY']) or isset($arr['CONDUCTIVITY']) or isset($arr['SPECIFIC_HEAT']) ))  { $addTag='GEOMETRY_MATL'; }

			# RAMP
			elseif ($amper=='&RAMP') { $addTag=$this->surfsMatlsFriends['&RAMP'][$arr['ID']]."_2RAMP"; }

			# VENT
			elseif (($amper=='&VENT') and ($arr['SURF_ID']=="'OPEN'")) { $addTag='MESH_OPEN'; }
			elseif ($amper=='&VENT') { $addTag=$this->surfsMatlsFriends['&SURF'][$arr['SURF_ID']]."_1VENT"; }
			
			if(empty($addTag)) { $addTag='UNKNOWN'; }

			$this->atoms[$k]['tag']=$addTag;
		}
	}

/*}}}*/
	private function addToMatlsLibrary() {/*{{{*/
		$infos=[];
		$infos['exist']='';
		$infos['added']='';
		$r=$_SESSION['db']->pg("select my_name from matls_library");
		$knownMatls=[];
		foreach($r as $i) {
			extract($i);
			$knownMatls[]="$my_name";
		}
		foreach($this->atoms as $atom) { 
			if($atom['amper']=='&MATL') { 
				if(in_array($atom['ID'], $knownMatls)) {
					$infos['exist'].=" ".$atom['ID'];
				} else {
					$_SESSION['db']->pg("insert into matls_library(my_name, my_content, user_id) values ($1, $2, $3);", array($atom['ID'], $atom['rawLine'], 1));
					$infos['added'].=" ".$atom['ID'];
				}
			}
		}
		if(!empty($infos['added'])) { $this->collectMsgInfos[0][]="New MATLS added to matlsLibrary:".$infos['added']; }
		if(!empty($infos['exist'])) { $this->collectMsgInfos[0][]="Already in matlsLibrary:".$infos['exist']; }
	}
/*}}}*/
	private function addToSurfsLibrary() {/*{{{*/
		$infos=[];
		$infos['exist']='';
		$infos['added']='';
		$r=$_SESSION['db']->pg("select my_name from surfs_library");
		$knownSurfs=[];
		foreach($r as $i) {
			extract($i);
			$knownSurfs[]="$my_name";
		}
		foreach($this->atoms as $atom) { 
			$link='';
			if($atom['amper']=='&SURF') { 
				$nu=$atom['rawLineNo'];
				foreach($atom as $k=>$v) {
					if(preg_match('/MATL_ID/', $k)) {
						$link=$v;
						break;
					}
				}
				if(in_array($atom['ID'], $knownSurfs)) {
					$infos['exist'].=" ".$atom['ID'];
				} else {
					$_SESSION['db']->pg("insert into surfs_library(my_name, my_content, link, user_id) values ($1, $2, $3, $4);", array($atom['ID'], $atom['rawLine'], $link, 1));
					$infos['added'].=" ".$atom['ID'];
				}
			}
		}
		if(!empty($infos['added'])) { $this->collectMsgInfos[0][]="New SURFS added to surfsLibrary:".$infos['added']; }
		if(!empty($infos['exist'])) { $this->collectMsgInfos[0][]="Already in surfsLibrary:".$infos['exist']; }
	}
	/*}}}*/
	private function isSurfMissingMatls() {/*{{{*/
		$knownMatls=[];
		foreach($this->atoms as $atom) { 
			if($atom['amper']=='&MATL') { 
				$knownMatls[]=$atom['ID'];
			}
		}
		foreach($this->atoms as $atom) { 
			$allMatlsInTheSurf=[];
			if($atom['amper']=='&SURF') { 
				$nu=$atom['rawLineNo'];
				foreach($atom as $k=>$v) {
					if(preg_match('/MATL_ID/', $k)) {
						$allMatlsInTheSurf=preg_split('/,\s*/',$v);
						break;
					}
				}
				foreach($allMatlsInTheSurf as $i) {
					$i=preg_replace("/\s*$|^\s*/", '', $i);
					if(!in_array("$i", $knownMatls)) { $this->collectMsgErrors[$nu][]="MATL $i referenced in the SURF ".$atom['ID']." doesn't exist"; }
				}
			}
		}
	}
	/*}}}*/

	public function getFromMatlsLibrary($i) {/*{{{*/
		$this->rawContentIntoCommandsArray();
		$this->fds2atoms(); 
		$inFile=[];
		$inFile['matls']=[];
		foreach($this->atoms as $atom) {
			if($atom['amper']=='&MATL') { $inFile['matls'][]=$atom['ID']; }
		}

		if(in_array("'$i'", $inFile['matls'])) { $this->collectMsgInfos[0][]="MATL $i already in the current file";  return $this->returnPodsumowanie('getFromMatlsLibrary'); }
		$r=$_SESSION['db']->pg("select my_content from matls_library where my_name=$1 and user_id=$2", array("'$i'",1));
		if(empty($r)) { $this->collectMsgErros[0][]="$i: no such matl in matlsLibrary"; }  else { $this->collectData[]=$r[0]['my_content']; }
		return $this->returnPodsumowanie('getFromMatlsLibrary');
	}
	/*}}}*/
	public function getFromSurfsLibrary($i) {/*{{{*/
		$this->rawContentIntoCommandsArray();
		$this->fds2atoms(); 
		$inFile=[];
		$inFile['matls']=[];
		$inFile['surfs']=[];
		foreach($this->atoms as $atom) {
			if($atom['amper']=='&MATL') { $inFile['matls'][]=$atom['ID']; }
			if($atom['amper']=='&SURF') { $inFile['surfs'][]=$atom['ID']; }
		}
		if(in_array("'$i'", $inFile['surfs'])) { $this->collectMsgInfos[0][]="SURF '$i' already in the current file";  return $this->returnPodsumowanie('getFromSurfsLibrary'); }

		# db get surfs
		$r=$_SESSION['db']->pg("select my_content,link from surfs_library where my_name=$1 and user_id=$2", array("'$i'",1));
		if(empty($r)) { $this->collectMsgErros[0][]="$i: no such surf in surfsLibrary"; }
		$this->collectData[]=$r[0]['my_content'];
		$matls=preg_split('/,\s*/', $r[0]['link']);
		foreach($matls as $k=>$v) {
			if(in_array("$v", $inFile['matls'])) { $this->collectMsgInfos[0][]="MATL $v already in the current file"; } 
			else { $matls[$k]="''$v''"; }
		}

		# db get linked matls
		$condition="where my_name=".join(" OR my_name=", $matls);
		$r=$_SESSION['db']->pg("select * from matls_library $condition", array());
		#$r=$_SESSION['db']->pgdd("select * from matls_library $condition", array());
		if(!empty($r)) { 
			foreach($r as $i) {
				$this->collectData[]=$i['my_content'];
			}
		}
		return $this->returnPodsumowanie('getFromSurfsLibrary');
	}
	/*}}}*/

	public function getManualUrl($q) {{{{
		$q=strtoupper($q);
		switch ($q)   {
			case '&BNDF:&BNDF':                           $this->collectData[]='FDS_User_Guide.pdf#section.16.5'        ; $this->returnPodsumowanie('fdsManual');
			case '&BNDF:CELL_CENTERED':                   $this->collectData[]='FDS_User_Guide.pdf#section.16.5'        ; $this->returnPodsumowanie('fdsManual');
			case '&BNDF:PART_ID':                         $this->collectData[]='FDS_User_Guide.pdf#section.16.12'       ; $this->returnPodsumowanie('fdsManual');
			case '&BNDF:PROP_ID':                         $this->collectData[]='FDS_User_Guide.pdf#section.16.5'        ; $this->returnPodsumowanie('fdsManual');
			case '&BNDF:QUANTITY':                        $this->collectData[]='FDS_User_Guide.pdf#section.16.12'       ; $this->returnPodsumowanie('fdsManual');
			case '&BNDF:SPEC_ID':                         $this->collectData[]='FDS_User_Guide.pdf#section.16.12'       ; $this->returnPodsumowanie('fdsManual');
			case '&BNDF:STATISTICS':                      $this->collectData[]='FDS_User_Guide.pdf#section.16.5'        ; $this->returnPodsumowanie('fdsManual');

			case '&CLIP:&CLIP':                           $this->collectData[]='FDS_User_Guide.pdf#section.6.7'         ; $this->returnPodsumowanie('fdsManual');
			case '&CLIP:MAXIMUM_DENSITY':                 $this->collectData[]='FDS_User_Guide.pdf#section.6.7'         ; $this->returnPodsumowanie('fdsManual');
			case '&CLIP:MAXIMUM_TEMPERATURE':             $this->collectData[]='FDS_User_Guide.pdf#section.6.7'         ; $this->returnPodsumowanie('fdsManual');
			case '&CLIP:MINIMUM_DENSITY':                 $this->collectData[]='FDS_User_Guide.pdf#section.6.7'         ; $this->returnPodsumowanie('fdsManual');
			case '&CLIP:MINIMUM_TEMPERATURE':             $this->collectData[]='FDS_User_Guide.pdf#section.6.7'         ; $this->returnPodsumowanie('fdsManual');

			case '&CSVF:&CSVF':                           $this->collectData[]='FDS_User_Guide.pdf#subsection.6.4.5'    ; $this->returnPodsumowanie('fdsManual');
			case '&CSVF:UVWFILE':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.6.4.5'    ; $this->returnPodsumowanie('fdsManual');

			case '&CTRL:&CTRL':                           $this->collectData[]='FDS_User_Guide.pdf#section.15.5'        ; $this->returnPodsumowanie('fdsManual');
			case '&CTRL:CONSTANT':                        $this->collectData[]='FDS_User_Guide.pdf#subsection.15.5.6'   ; $this->returnPodsumowanie('fdsManual');
			case '&CTRL:DELAY':                           $this->collectData[]='FDS_User_Guide.pdf#subsection.15.5.9'   ; $this->returnPodsumowanie('fdsManual');
			case '&CTRL:DIFFERENTIAL_GAIN':               $this->collectData[]='FDS_User_Guide.pdf#subsection.15.5.7'   ; $this->returnPodsumowanie('fdsManual');
			case '&CTRL:EVACUATION':                      $this->collectData[]='FDS_User_Guide.pdf#Reference[53]'       ; $this->returnPodsumowanie('fdsManual');
			case '&CTRL:FUNCTION_TYPE':                   $this->collectData[]='FDS_User_Guide.pdf#section.15.4'        ; $this->returnPodsumowanie('fdsManual');
			case '&CTRL:ID':                              $this->collectData[]='FDS_User_Guide.pdf#section.15.5'        ; $this->returnPodsumowanie('fdsManual');
			case '&CTRL:INITIAL_STATE':                   $this->collectData[]='FDS_User_Guide.pdf#section.15.4'        ; $this->returnPodsumowanie('fdsManual');
			case '&CTRL:INPUT_ID':                        $this->collectData[]='FDS_User_Guide.pdf#section.15.5'        ; $this->returnPodsumowanie('fdsManual');
			case '&CTRL:INTEGRAL_GAIN':                   $this->collectData[]='FDS_User_Guide.pdf#subsection.15.5.7'   ; $this->returnPodsumowanie('fdsManual');
			case '&CTRL:LATCH':                           $this->collectData[]='FDS_User_Guide.pdf#section.15.4'        ; $this->returnPodsumowanie('fdsManual');
			case '&CTRL:N':                               $this->collectData[]='FDS_User_Guide.pdf#section.15.5'        ; $this->returnPodsumowanie('fdsManual');
			case '&CTRL:ON_BOUND':                        $this->collectData[]='FDS_User_Guide.pdf#subsection.15.5.3'   ; $this->returnPodsumowanie('fdsManual');
			case '&CTRL:PROPORTIONAL_GAIN':               $this->collectData[]='FDS_User_Guide.pdf#subsection.15.5.7'   ; $this->returnPodsumowanie('fdsManual');
			case '&CTRL:RAMP_ID':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.15.5.5'   ; $this->returnPodsumowanie('fdsManual');
			case '&CTRL:SETPOINT':                        $this->collectData[]='FDS_User_Guide.pdf#section.15.4'        ; $this->returnPodsumowanie('fdsManual');
			case '&CTRL:TARGET_VALUE':                    $this->collectData[]='FDS_User_Guide.pdf#subsection.15.5.7'   ; $this->returnPodsumowanie('fdsManual');
			case '&CTRL:TRIP_DIRECTION':                  $this->collectData[]='FDS_User_Guide.pdf#section.15.4'        ; $this->returnPodsumowanie('fdsManual');

			case '&DEVC:&DEVC':                           $this->collectData[]='FDS_User_Guide.pdf#section.15.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:BYPASS_FLOWRATE':                 $this->collectData[]='FDS_User_Guide.pdf#subsection.15.3.7'   ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:CONVERSION_FACTOR':               $this->collectData[]='FDS_User_Guide.pdf#section.15.2'        ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:COORD_FACTOR':                    $this->collectData[]='FDS_User_Guide.pdf#section.15.2'        ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:CTRL_ID':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.15.6.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:DELAY':                           $this->collectData[]='FDS_User_Guide.pdf#subsection.15.3.7'   ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:DEPTH':                           $this->collectData[]='FDS_User_Guide.pdf#subsection.16.10.8'  ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:DEVC_ID':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.15.3.7'   ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:DRY':                             $this->collectData[]='FDS_User_Guide.pdf#subsection.16.10.15' ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:DUCT_ID':                         $this->collectData[]='FDS_User_Guide.pdf#section.9.2'         ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:EVACUATION':                      $this->collectData[]='FDS_User_Guide.pdf#Reference[53]'       ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:FLOWRATE':                        $this->collectData[]='FDS_User_Guide.pdf#subsection.15.3.7'   ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:HIDE_COORDINATES':                $this->collectData[]='FDS_User_Guide.pdf#subsection.16.2.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:ID':                              $this->collectData[]='FDS_User_Guide.pdf#section.15.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:INITIAL_STATE':                   $this->collectData[]='FDS_User_Guide.pdf#section.15.4'        ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:INIT_ID':                         $this->collectData[]='FDS_User_Guide.pdf#section.14.4'        ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:IOR':                             $this->collectData[]='FDS_User_Guide.pdf#section.15.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:LATCH':                           $this->collectData[]='FDS_User_Guide.pdf#section.15.4'        ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:MATL_ID':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.16.10.8'  ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:NODE_ID':                         $this->collectData[]='FDS_User_Guide.pdf#section.9.2'         ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:NO_UPDATE_DEVC_ID':               $this->collectData[]='FDS_User_Guide.pdf#subsection.15.6.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:NO_UPDATE_CTRL_ID':               $this->collectData[]='FDS_User_Guide.pdf#subsection.15.6.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:ORIENTATION':                     $this->collectData[]='FDS_User_Guide.pdf#section.15.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:ORIENTATION_NUMBER':              $this->collectData[]='FDS_User_Guide.pdf#section.16.9'        ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:OUTPUT':                          $this->collectData[]='FDS_User_Guide.pdf#section.15.2'        ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:PART_ID':                         $this->collectData[]='FDS_User_Guide.pdf#section.16.12'       ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:PIPE_INDEX':                      $this->collectData[]='FDS_User_Guide.pdf#subsection.15.3.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:POINTS':                          $this->collectData[]='FDS_User_Guide.pdf#subsection.16.2.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:PROP_ID':                         $this->collectData[]='FDS_User_Guide.pdf#section.15.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:QUANTITY':                        $this->collectData[]='FDS_User_Guide.pdf#section.15.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:QUANTITY2':                       $this->collectData[]='FDS_User_Guide.pdf#subsection.16.2.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:QUANTITY_RANGE':                  $this->collectData[]='FDS_User_Guide.pdf#subsection.16.10.10' ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:RELATIVE':                        $this->collectData[]='FDS_User_Guide.pdf#section.15.2'        ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:ROTATION':                        $this->collectData[]='FDS_User_Guide.pdf#section.15.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:SETPOINT':                        $this->collectData[]='FDS_User_Guide.pdf#section.15.4'        ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:STATISTICS':                      $this->collectData[]='FDS_User_Guide.pdf#subsection.16.10.10' ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:STATISTICS_START':                $this->collectData[]='FDS_User_Guide.pdf#subsection.16.10.12' ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:SMOOTHING_FACTOR':                $this->collectData[]='FDS_User_Guide.pdf#section.15.4'        ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:SPEC_ID':                         $this->collectData[]='FDS_User_Guide.pdf#section.16.12'       ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:SURF_ID':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.16.10.10' ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:TIME_AVERAGED':                   $this->collectData[]='FDS_User_Guide.pdf#section.15.2'        ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:TRIP_DIRECTION':                  $this->collectData[]='FDS_User_Guide.pdf#section.15.4'        ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:UNITS':                           $this->collectData[]='FDS_User_Guide.pdf#section.15.2'        ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:VELO_INDEX':                      $this->collectData[]='FDS_User_Guide.pdf#subsection.16.10.17' ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:XB':                              $this->collectData[]='FDS_User_Guide.pdf#subsection.16.10.10' ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:XYZ':                             $this->collectData[]='FDS_User_Guide.pdf#section.15.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:X_ID':                            $this->collectData[]='FDS_User_Guide.pdf#subsection.16.2.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:Y_ID':                            $this->collectData[]='FDS_User_Guide.pdf#subsection.16.2.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&DEVC:Z_ID':                            $this->collectData[]='FDS_User_Guide.pdf#subsection.16.2.2'   ; $this->returnPodsumowanie('fdsManual');

			case '&DUMP:&DUMP':                           $this->collectData[]='FDS_User_Guide.pdf#section.16.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&DUMP:CLIP_RESTART_FILES':              $this->collectData[]='FDS_User_Guide.pdf#subsection.6.4.4'    ; $this->returnPodsumowanie('fdsManual');
			case '&DUMP:COLUMN_DUMP_LIMIT':               $this->collectData[]='FDS_User_Guide.pdf#section.15.2'        ; $this->returnPodsumowanie('fdsManual');
			case '&DUMP:CTRL_COLUMN_LIMIT':               $this->collectData[]='FDS_User_Guide.pdf#section.15.2'        ; $this->returnPodsumowanie('fdsManual');
			case '&DUMP:DEVC_COLUMN_LIMIT':               $this->collectData[]='FDS_User_Guide.pdf#section.15.2'        ; $this->returnPodsumowanie('fdsManual');
			case '&DUMP:DT_BNDF':                         $this->collectData[]='FDS_User_Guide.pdf#section.16.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&DUMP:DT_CTRL':                         $this->collectData[]='FDS_User_Guide.pdf#section.16.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&DUMP:DT_DEVC':                         $this->collectData[]='FDS_User_Guide.pdf#section.16.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&DUMP:DT_DEVC_LINE':                    $this->collectData[]='FDS_User_Guide.pdf#subsection.16.2.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&DUMP:DT_FLUSH':                        $this->collectData[]='FDS_User_Guide.pdf#section.16.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&DUMP:DT_HRR':                          $this->collectData[]='FDS_User_Guide.pdf#section.16.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&DUMP:DT_ISOF':                         $this->collectData[]='FDS_User_Guide.pdf#section.16.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&DUMP:DT_MASS':                         $this->collectData[]='FDS_User_Guide.pdf#section.16.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&DUMP:DT_PART':                         $this->collectData[]='FDS_User_Guide.pdf#section.16.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&DUMP:DT_PL3D':                         $this->collectData[]='FDS_User_Guide.pdf#section.16.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&DUMP:DT_PROF':                         $this->collectData[]='FDS_User_Guide.pdf#section.16.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&DUMP:DT_RESTART':                      $this->collectData[]='FDS_User_Guide.pdf#section.16.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&DUMP:DT_SL3D':                         $this->collectData[]='FDS_User_Guide.pdf#section.16.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&DUMP:DT_SLCF':                         $this->collectData[]='FDS_User_Guide.pdf#section.16.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&DUMP:EB_PART_FILE':                    $this->collectData[]='FDS_User_Guide.pdf#section.16.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&DUMP:FLUSH_FILE_BUFFERS':              $this->collectData[]='FDS_User_Guide.pdf#section.16.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&DUMP:MASS_FILE':                       $this->collectData[]='FDS_User_Guide.pdf#section.16.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&DUMP:MAXIMUM_PARTICLES':               $this->collectData[]='FDS_User_Guide.pdf#section.16.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&DUMP:NFRAMES':                         $this->collectData[]='FDS_User_Guide.pdf#section.16.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&DUMP:PLOT3D_PART_ID':                  $this->collectData[]='FDS_User_Guide.pdf#section.16.7'        ; $this->returnPodsumowanie('fdsManual');
			case '&DUMP:PLOT3D_QUANTITY':                 $this->collectData[]='FDS_User_Guide.pdf#section.16.7'        ; $this->returnPodsumowanie('fdsManual');
			case '&DUMP:PLOT3D_SPEC_ID':                  $this->collectData[]='FDS_User_Guide.pdf#section.16.7'        ; $this->returnPodsumowanie('fdsManual');
			case '&DUMP:PLOT3D_VELO_INDEX':               $this->collectData[]='FDS_User_Guide.pdf#subsection.16.10.17' ; $this->returnPodsumowanie('fdsManual');
			case '&DUMP:RENDER_FILE':                     $this->collectData[]='FDS_User_Guide.pdf#Reference[2]'        ; $this->returnPodsumowanie('fdsManual');
			case '&DUMP:SIG_FIGS':                        $this->collectData[]='FDS_User_Guide.pdf#subsection.16.10.20' ; $this->returnPodsumowanie('fdsManual');
			case '&DUMP:SIG_FIGS_EXP':                    $this->collectData[]='FDS_User_Guide.pdf#subsection.16.10.20' ; $this->returnPodsumowanie('fdsManual');
			case '&DUMP:SMOKE3D':                         $this->collectData[]='FDS_User_Guide.pdf#section.16.8'        ; $this->returnPodsumowanie('fdsManual');
			case '&DUMP:SMOKE3D_QUANTITY':                $this->collectData[]='FDS_User_Guide.pdf#section.16.8'        ; $this->returnPodsumowanie('fdsManual');
			case '&DUMP:SMOKE3D_SPEC_ID':                 $this->collectData[]='FDS_User_Guide.pdf#section.16.8'        ; $this->returnPodsumowanie('fdsManual');
			case '&DUMP:STATUS_FILES':                    $this->collectData[]='FDS_User_Guide.pdf#section.16.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&DUMP:SUPPRESS_DIAGNOSTICS':            $this->collectData[]='FDS_User_Guide.pdf#section.3.2'         ; $this->returnPodsumowanie('fdsManual');
			case '&DUMP:UVW_TIMER':                       $this->collectData[]='FDS_User_Guide.pdf#subsection.6.4.5'    ; $this->returnPodsumowanie('fdsManual');
			case '&DUMP:VELOCITY_ERROR_FILE':             $this->collectData[]='FDS_User_Guide.pdf#subsection.16.10.19' ; $this->returnPodsumowanie('fdsManual');
			case '&DUMP:WRITE_XYZ':                       $this->collectData[]='FDS_User_Guide.pdf#section.16.7'        ; $this->returnPodsumowanie('fdsManual');

			case '&HEAD:&HEAD':                           $this->collectData[]='FDS_User_Guide.pdf#section.6.1'         ; $this->returnPodsumowanie('fdsManual');
			case '&HEAD:CHID':                            $this->collectData[]='FDS_User_Guide.pdf#section.6.1'         ; $this->returnPodsumowanie('fdsManual');
			case '&HEAD:TITLE':                           $this->collectData[]='FDS_User_Guide.pdf#section.16.7'        ; $this->returnPodsumowanie('fdsManual');

			case '&HOLE:&HOLE':                           $this->collectData[]='FDS_User_Guide.pdf#subsection.7.2.6'    ; $this->returnPodsumowanie('fdsManual');
			case '&HOLE:COLOR':                           $this->collectData[]='FDS_User_Guide.pdf#section.7.4'         ; $this->returnPodsumowanie('fdsManual');
			case '&HOLE:CTRL_ID':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.7.2.6'    ; $this->returnPodsumowanie('fdsManual');
			case '&HOLE:DEVC_ID':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.7.2.6'    ; $this->returnPodsumowanie('fdsManual');
			case '&HOLE:EVACUATION':                      $this->collectData[]='FDS_User_Guide.pdf#Reference[53]'       ; $this->returnPodsumowanie('fdsManual');
			case '&HOLE:ID':							  $this->collectData[]='FDS_User_Guide.pdf#Identiﬁerforinput'   ; $this->returnPodsumowanie('fdsManual');
			case '&HOLE:MESH_ID':                         $this->collectData[]='FDS_User_Guide.pdf#Reference[53]'       ; $this->returnPodsumowanie('fdsManual');
			case '&HOLE:MULT_ID':                         $this->collectData[]='FDS_User_Guide.pdf#section.7.5'         ; $this->returnPodsumowanie('fdsManual');
			case '&HOLE:RGB':                             $this->collectData[]='FDS_User_Guide.pdf#section.7.4'         ; $this->returnPodsumowanie('fdsManual');
			case '&HOLE:TRANSPARENCY':                    $this->collectData[]='FDS_User_Guide.pdf#subsection.7.2.6'    ; $this->returnPodsumowanie('fdsManual');
			case '&HOLE:XB':                              $this->collectData[]='FDS_User_Guide.pdf#section.7.5'         ; $this->returnPodsumowanie('fdsManual');

			case '&HVAC:&HVAC':                           $this->collectData[]='FDS_User_Guide.pdf#section.9.2'         ; $this->returnPodsumowanie('fdsManual');
			case '&HVAC:AIRCOIL_ID':                      $this->collectData[]='FDS_User_Guide.pdf#subsection.9.2.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&HVAC:AMBIENT':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.9.2.3'    ; $this->returnPodsumowanie('fdsManual');
			case '&HVAC:AREA':                            $this->collectData[]='FDS_User_Guide.pdf#subsection.9.2.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&HVAC:CLEAN_LOSS':                      $this->collectData[]='FDS_User_Guide.pdf#subsection.9.2.5'    ; $this->returnPodsumowanie('fdsManual');
			case '&HVAC:COOLANT_MASS_FLOW':               $this->collectData[]='FDS_User_Guide.pdf#subsection.9.2.6'    ; $this->returnPodsumowanie('fdsManual');
			case '&HVAC:COOLANT_SPECIFIC_HEAT':           $this->collectData[]='FDS_User_Guide.pdf#subsection.9.2.6'    ; $this->returnPodsumowanie('fdsManual');
			case '&HVAC:COOLANT_TEMPERATURE':             $this->collectData[]='FDS_User_Guide.pdf#subsection.9.2.6'    ; $this->returnPodsumowanie('fdsManual');
			case '&HVAC:CTRL_ID':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.9.2.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&HVAC:DAMPER':                          $this->collectData[]='FDS_User_Guide.pdf#subsection.9.2.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&HVAC:DEVC_ID':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.9.2.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&HVAC:DIAMETER':                        $this->collectData[]='FDS_User_Guide.pdf#subsection.9.2.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&HVAC:DUCT_ID':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.9.2.3'    ; $this->returnPodsumowanie('fdsManual');
			case '&HVAC:EFFICIENCY':                      $this->collectData[]='FDS_User_Guide.pdf#subsection.9.2.5'    ; $this->returnPodsumowanie('fdsManual');
			case '&HVAC:FAN_ID':                          $this->collectData[]='FDS_User_Guide.pdf#subsection.9.2.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&HVAC:FILTER_ID':                       $this->collectData[]='FDS_User_Guide.pdf#subsection.9.2.3'    ; $this->returnPodsumowanie('fdsManual');
			case '&HVAC:FIXED_Q':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.9.2.6'    ; $this->returnPodsumowanie('fdsManual');
			case '&HVAC:ID':                              $this->collectData[]='FDS_User_Guide.pdf#section.9.2'         ; $this->returnPodsumowanie('fdsManual');
			case '&HVAC:LEAK_ENTHALPY':                   $this->collectData[]='FDS_User_Guide.pdf#subsection.9.3.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&HVAC:LENGTH':                          $this->collectData[]='FDS_User_Guide.pdf#subsection.9.2.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&HVAC:LOADING':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.9.2.5'    ; $this->returnPodsumowanie('fdsManual');
			case '&HVAC:LOADING_MULTIPLIER':              $this->collectData[]='FDS_User_Guide.pdf#subsection.9.2.5'    ; $this->returnPodsumowanie('fdsManual');
			case '&HVAC:LOSS':                            $this->collectData[]='FDS_User_Guide.pdf#subsection.9.2.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&HVAC:MASS_FLOW':                       $this->collectData[]='FDS_User_Guide.pdf#subsection.9.2.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&HVAC:MAX_FLOW':                        $this->collectData[]='FDS_User_Guide.pdf#subsection.9.2.4'    ; $this->returnPodsumowanie('fdsManual');
			case '&HVAC:MAX_PRESSURE':                    $this->collectData[]='FDS_User_Guide.pdf#subsection.9.2.4'    ; $this->returnPodsumowanie('fdsManual');
			case '&HVAC:NODE_ID':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.9.2.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&HVAC:PERIMETER':                       $this->collectData[]='FDS_User_Guide.pdf#subsection.9.2.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&HVAC:RAMP_ID':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.9.2.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&HVAC:REVERSE':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.9.2.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&HVAC:ROUGHNESS':                       $this->collectData[]='FDS_User_Guide.pdf#subsection.9.2.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&HVAC:SPEC_ID':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.9.2.5'    ; $this->returnPodsumowanie('fdsManual');
			case '&HVAC:TAU_AC':                          $this->collectData[]='FDS_User_Guide.pdf#subsection.9.2.6'    ; $this->returnPodsumowanie('fdsManual');
			case '&HVAC:TAU_FAN':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.9.2.4'    ; $this->returnPodsumowanie('fdsManual');
			case '&HVAC:TAU_VF':                          $this->collectData[]='FDS_User_Guide.pdf#subsection.9.2.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&HVAC:TYPE_ID':                         $this->collectData[]='FDS_User_Guide.pdf#section.9.2'         ; $this->returnPodsumowanie('fdsManual');
			case '&HVAC:VENT_ID':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.9.2.3'    ; $this->returnPodsumowanie('fdsManual');
			case '&HVAC:VENT2_ID':                        $this->collectData[]='FDS_User_Guide.pdf#subsection.9.3.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&HVAC:VOLUME_FLOW':                     $this->collectData[]='FDS_User_Guide.pdf#subsection.9.2.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&HVAC:XYZ':                             $this->collectData[]='FDS_User_Guide.pdf#subsection.9.2.3'    ; $this->returnPodsumowanie('fdsManual');

			case '&INIT:&INIT':                           $this->collectData[]='FDS_User_Guide.pdf#section.6.5'         ; $this->returnPodsumowanie('fdsManual');
			case '&INIT:CELL_CENTERED':                   $this->collectData[]='FDS_User_Guide.pdf#subsection.14.5.3'   ; $this->returnPodsumowanie('fdsManual');
			case '&INIT:CTRL_ID':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.14.5.3'   ; $this->returnPodsumowanie('fdsManual');
			case '&INIT:DENSITY':                         $this->collectData[]='FDS_User_Guide.pdf#section.6.5'         ; $this->returnPodsumowanie('fdsManual');
			case '&INIT:DEVC_ID':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.14.5.3'   ; $this->returnPodsumowanie('fdsManual');
			case '&INIT:DIAMETER':                        $this->collectData[]='FDS_User_Guide.pdf#subsection.14.5.3'   ; $this->returnPodsumowanie('fdsManual');
			case '&INIT:DT_INSERT':                       $this->collectData[]='FDS_User_Guide.pdf#subsection.14.5.3'   ; $this->returnPodsumowanie('fdsManual');
			case '&INIT:DX':                              $this->collectData[]='FDS_User_Guide.pdf#subsection.14.5.3'   ; $this->returnPodsumowanie('fdsManual');
			case '&INIT:DY':                              $this->collectData[]='FDS_User_Guide.pdf#subsection.14.5.3'   ; $this->returnPodsumowanie('fdsManual');
			case '&INIT:DZ':                              $this->collectData[]='FDS_User_Guide.pdf#subsection.14.5.3'   ; $this->returnPodsumowanie('fdsManual');
			case '&INIT:HEIGHT':                          $this->collectData[]='FDS_User_Guide.pdf#subsection.14.5.3'   ; $this->returnPodsumowanie('fdsManual');
			case '&INIT:HRRPUV':                          $this->collectData[]='FDS_User_Guide.pdf#section.6.5'         ; $this->returnPodsumowanie('fdsManual');
			case '&INIT:ID':                              $this->collectData[]='FDS_User_Guide.pdf#section.14.4'        ; $this->returnPodsumowanie('fdsManual');
			case '&INIT:MASS_FRACTION':                   $this->collectData[]='FDS_User_Guide.pdf#section.6.5'         ; $this->returnPodsumowanie('fdsManual');
			case '&INIT:MASS_PER_TIME':                   $this->collectData[]='FDS_User_Guide.pdf#subsection.14.5.3'   ; $this->returnPodsumowanie('fdsManual');
			case '&INIT:MASS_PER_VOLUME':                 $this->collectData[]='FDS_User_Guide.pdf#subsection.14.5.3'   ; $this->returnPodsumowanie('fdsManual');
			case '&INIT:MULT_ID':                         $this->collectData[]='FDS_User_Guide.pdf#section.7.5'         ; $this->returnPodsumowanie('fdsManual');
			case '&INIT:N_PARTICLES':                     $this->collectData[]='FDS_User_Guide.pdf#subsection.14.5.3'   ; $this->returnPodsumowanie('fdsManual');
			case '&INIT:N_PARTICLES_PER_CELL':            $this->collectData[]='FDS_User_Guide.pdf#subsection.14.5.3'   ; $this->returnPodsumowanie('fdsManual');
			case '&INIT:PART_ID':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.14.5.3'   ; $this->returnPodsumowanie('fdsManual');
			case '&INIT:PARTICLE_WEIGHT_FACTOR':          $this->collectData[]='FDS_User_Guide.pdf#subsection.14.5.3'   ; $this->returnPodsumowanie('fdsManual');
			case '&INIT:RADIUS':                          $this->collectData[]='FDS_User_Guide.pdf#subsection.14.5.3'   ; $this->returnPodsumowanie('fdsManual');
			case '&INIT:SHAPE':                           $this->collectData[]='FDS_User_Guide.pdf#subsection.14.5.3'   ; $this->returnPodsumowanie('fdsManual');
			case '&INIT:SPEC_ID':                         $this->collectData[]='FDS_User_Guide.pdf#section.6.5'         ; $this->returnPodsumowanie('fdsManual');
			case '&INIT:TEMPERATURE':                     $this->collectData[]='FDS_User_Guide.pdf#section.6.5'         ; $this->returnPodsumowanie('fdsManual');
			case '&INIT:UVW':                             $this->collectData[]='FDS_User_Guide.pdf#subsection.14.5.3'   ; $this->returnPodsumowanie('fdsManual');
			case '&INIT:XB':                              $this->collectData[]='FDS_User_Guide.pdf#section.6.5'         ; $this->returnPodsumowanie('fdsManual');
			case '&INIT:XYZ':                             $this->collectData[]='FDS_User_Guide.pdf#subsection.14.5.3'   ; $this->returnPodsumowanie('fdsManual');

			case '&ISOF:&ISOF':                           $this->collectData[]='FDS_User_Guide.pdf#section.16.6'        ; $this->returnPodsumowanie('fdsManual');
			case '&ISOF:QUANTITY':                        $this->collectData[]='FDS_User_Guide.pdf#section.16.6'        ; $this->returnPodsumowanie('fdsManual');
			case '&ISOF:REDUCE_TRIANGLES':                $this->collectData[]='FDS_User_Guide.pdf#Reference[2]'        ; $this->returnPodsumowanie('fdsManual');
			case '&ISOF:SPEC_ID':                         $this->collectData[]='FDS_User_Guide.pdf#section.16.6'        ; $this->returnPodsumowanie('fdsManual');
			case '&ISOF:VALUE':                           $this->collectData[]='FDS_User_Guide.pdf#section.16.6'        ; $this->returnPodsumowanie('fdsManual');
			case '&ISOF:VELO_INDEX':                      $this->collectData[]='FDS_User_Guide.pdf#subsection.16.10.17' ; $this->returnPodsumowanie('fdsManual');

			case '&MATL:&MATL':                           $this->collectData[]='FDS_User_Guide.pdf#section.8.3'         ; $this->returnPodsumowanie('fdsManual');
			case '&MATL:A':                               $this->collectData[]='FDS_User_Guide.pdf#section.8.5'         ; $this->returnPodsumowanie('fdsManual');
			case '&MATL:ABSORPTION_COEFFICIENT':          $this->collectData[]='FDS_User_Guide.pdf#subsection.8.3.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&MATL:ALLOW_SHRINKING':                 $this->collectData[]='FDS_User_Guide.pdf#subsection.8.5.3'    ; $this->returnPodsumowanie('fdsManual');
			case '&MATL:ALLOW_SWELLING':                  $this->collectData[]='FDS_User_Guide.pdf#subsection.8.5.3'    ; $this->returnPodsumowanie('fdsManual');
			case '&MATL:BOILING_TEMPERATURE':             $this->collectData[]='FDS_User_Guide.pdf#subsection.8.5.7'    ; $this->returnPodsumowanie('fdsManual');
			case '&MATL:CONDUCTIVITY':                    $this->collectData[]='FDS_User_Guide.pdf#subsection.8.3.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&MATL:CONDUCTIVITY_RAMP':               $this->collectData[]='FDS_User_Guide.pdf#subsection.8.3.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&MATL:DENSITY':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.8.3.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&MATL:E':                               $this->collectData[]='FDS_User_Guide.pdf#section.8.5'         ; $this->returnPodsumowanie('fdsManual');
			case '&MATL:EMISSIVITY':                      $this->collectData[]='FDS_User_Guide.pdf#subsection.8.3.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&MATL:GAS_DIFFUSION_DEPTH':             $this->collectData[]='FDS_User_Guide.pdf#section.8.5'         ; $this->returnPodsumowanie('fdsManual');
			case '&MATL:HEATING_RATE':                    $this->collectData[]='FDS_User_Guide.pdf#section.8.5'         ; $this->returnPodsumowanie('fdsManual');
			case '&MATL:HEAT_OF_COMBUSTION':              $this->collectData[]='FDS_User_Guide.pdf#section.8.5'         ; $this->returnPodsumowanie('fdsManual');
			case '&MATL:HEAT_OF_REACTION':                $this->collectData[]='FDS_User_Guide.pdf#section.8.5'         ; $this->returnPodsumowanie('fdsManual');
			case '&MATL:ID':                              $this->collectData[]='FDS_User_Guide.pdf#section.8.1'         ; $this->returnPodsumowanie('fdsManual');
			case '&MATL:MATL_ID':                         $this->collectData[]='FDS_User_Guide.pdf#section.8.5'         ; $this->returnPodsumowanie('fdsManual');
			case '&MATL:NU_MATL':                         $this->collectData[]='FDS_User_Guide.pdf#section.8.5'         ; $this->returnPodsumowanie('fdsManual');
			case '&MATL:NU_SPEC':                         $this->collectData[]='FDS_User_Guide.pdf#section.8.5'         ; $this->returnPodsumowanie('fdsManual');
			case '&MATL:N_REACTIONS':                     $this->collectData[]='FDS_User_Guide.pdf#section.8.5'         ; $this->returnPodsumowanie('fdsManual');
			case '&MATL:N_O2':                            $this->collectData[]='FDS_User_Guide.pdf#section.8.5'         ; $this->returnPodsumowanie('fdsManual');
			case '&MATL:N_S':                             $this->collectData[]='FDS_User_Guide.pdf#section.8.5'         ; $this->returnPodsumowanie('fdsManual');
			case '&MATL:N_T':                             $this->collectData[]='FDS_User_Guide.pdf#section.8.5'         ; $this->returnPodsumowanie('fdsManual');
			case '&MATL:PCR':                             $this->collectData[]='FDS_User_Guide.pdf#section.8.5'         ; $this->returnPodsumowanie('fdsManual');
			case '&MATL:PYROLYSIS_RANGE':                 $this->collectData[]='FDS_User_Guide.pdf#section.8.5'         ; $this->returnPodsumowanie('fdsManual');
			case '&MATL:REFERENCE_RATE':                  $this->collectData[]='FDS_User_Guide.pdf#section.8.5'         ; $this->returnPodsumowanie('fdsManual');
			case '&MATL:REFERENCE_TEMPERATURE':           $this->collectData[]='FDS_User_Guide.pdf#section.8.5'         ; $this->returnPodsumowanie('fdsManual');
			case '&MATL:SPECIFIC_HEAT':                   $this->collectData[]='FDS_User_Guide.pdf#subsection.8.3.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&MATL:SPECIFIC_HEAT_RAMP':              $this->collectData[]='FDS_User_Guide.pdf#subsection.8.3.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&MATL:SPEC_ID':                         $this->collectData[]='FDS_User_Guide.pdf#section.8.5'         ; $this->returnPodsumowanie('fdsManual');
			case '&MATL:THRESHOLD_SIGN':                  $this->collectData[]='FDS_User_Guide.pdf#section.8.5'         ; $this->returnPodsumowanie('fdsManual');
			case '&MATL:THRESHOLD_TEMPERATURE':           $this->collectData[]='FDS_User_Guide.pdf#section.8.5'         ; $this->returnPodsumowanie('fdsManual');

			case '&MESH:&MESH':                           $this->collectData[]='FDS_User_Guide.pdf#section.6.3'         ; $this->returnPodsumowanie('fdsManual');
			case '&MESH:COLOR':                           $this->collectData[]='FDS_User_Guide.pdf#subsection.6.3.3'    ; $this->returnPodsumowanie('fdsManual');
			case '&MESH:CYLINDRICAL':                     $this->collectData[]='FDS_User_Guide.pdf#subsection.6.3.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&MESH:EVACUATION':                      $this->collectData[]='FDS_User_Guide.pdf#Reference[53]'       ; $this->returnPodsumowanie('fdsManual');
			case '&MESH:EVAC_HUMANS':                     $this->collectData[]='FDS_User_Guide.pdf#Reference[53]'       ; $this->returnPodsumowanie('fdsManual');
			case '&MESH:EVAC_Z_OFFSET':                   $this->collectData[]='FDS_User_Guide.pdf#Reference[53]'       ; $this->returnPodsumowanie('fdsManual');
			case '&MESH:ID':                              $this->collectData[]='FDS_User_Guide.pdf#Reference[53]'       ; $this->returnPodsumowanie('fdsManual');
			case '&MESH:IJK':                             $this->collectData[]='FDS_User_Guide.pdf#subsection.6.3.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&MESH:LEVEL':                           $this->collectData[]='FDS_User_Guide.pdf#Forfutureuse0'       ; $this->returnPodsumowanie('fdsManual');
			case '&MESH:MPI_PROCESS':                     $this->collectData[]='FDS_User_Guide.pdf#subsection.6.3.3'    ; $this->returnPodsumowanie('fdsManual');
			case '&MESH:N_THREADS':                       $this->collectData[]='FDS_User_Guide.pdf#subsection.6.3.3'    ; $this->returnPodsumowanie('fdsManual');
			case '&MESH:MULT_ID':                         $this->collectData[]='FDS_User_Guide.pdf#section.7.5'         ; $this->returnPodsumowanie('fdsManual');
			case '&MESH:RGB':                             $this->collectData[]='FDS_User_Guide.pdf#subsection.6.3.3'    ; $this->returnPodsumowanie('fdsManual');
			case '&MESH:XB':                              $this->collectData[]='FDS_User_Guide.pdf#subsection.6.3.1'    ; $this->returnPodsumowanie('fdsManual');

			case '&MISC:&MISC':                           $this->collectData[]='FDS_User_Guide.pdf#section.6.4'         ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:ALLOW_SURFACE_PARTICLES':         $this->collectData[]='FDS_User_Guide.pdf#subsection.14.6.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:ALLOW_UNDERSIDE_PARTICLES':       $this->collectData[]='FDS_User_Guide.pdf#subsection.14.6.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:ASSUMED_GAS_TEMPERATURE':         $this->collectData[]='FDS_User_Guide.pdf#section.8.6'         ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:ASSUMED_GAS_TEMPERATURE_RAMP':    $this->collectData[]='FDS_User_Guide.pdf#section.8.6'         ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:BAROCLINIC':                      $this->collectData[]='FDS_User_Guide.pdf#subsection.6.4.7'    ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:BNDF_DEFAULT':                    $this->collectData[]='FDS_User_Guide.pdf#section.16.5'        ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:CNF_CUTOFF':                      $this->collectData[]='FDS_User_Guide.pdf#subsection.14.3.3'   ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:CFL_MAX':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.6.4.9'    ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:CFL_MIN':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.6.4.9'    ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:CFL_VELOCITY_NORM':               $this->collectData[]='FDS_User_Guide.pdf#subsection.6.4.9'    ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:CHECK_HT':                        $this->collectData[]='FDS_User_Guide.pdf#subsection.6.4.9'    ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:CHECK_VN':                        $this->collectData[]='FDS_User_Guide.pdf#subsection.6.4.9'    ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:CLIP_MASS_FRACTION':              $this->collectData[]='FDS_User_Guide.pdf#section.6.7'         ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:C_DEARDORFF':                     $this->collectData[]='FDS_User_Guide.pdf#subsection.6.4.8'    ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:C_SMAGORINSKY':                   $this->collectData[]='FDS_User_Guide.pdf#subsection.6.4.8'    ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:C_VREMAN':                        $this->collectData[]='FDS_User_Guide.pdf#subsection.6.4.8'    ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:CONSTANT_SPECIFIC_HEAT_RATIO':    $this->collectData[]='FDS_User_Guide.pdf#subsection.11.1.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:DNS':                             $this->collectData[]='FDS_User_Guide.pdf#subsection.6.4.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:DRIFT_FLUX':                      $this->collectData[]='FDS_User_Guide.pdf#section.12.5'        ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:DT_HVAC':                         $this->collectData[]='FDS_User_Guide.pdf#section.9.2'         ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:DT_MEAN_FORCING':                 $this->collectData[]='FDS_User_Guide.pdf#subsection.6.4.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:EVACUATION_DRILL':                $this->collectData[]='FDS_User_Guide.pdf#Reference[53]'       ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:EVACUATION_MC_MODE':              $this->collectData[]='FDS_User_Guide.pdf#Reference[53]'       ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:EVAC_PRESSURE_ITERATIONS':        $this->collectData[]='FDS_User_Guide.pdf#Reference[53]'       ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:EVAC_TIME_ITERATIONS':            $this->collectData[]='FDS_User_Guide.pdf#Reference[53]'       ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:FLUX_LIMITER':                    $this->collectData[]='FDS_User_Guide.pdf#subsection.6.4.10'   ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:FORCE_VECTOR':                    $this->collectData[]='FDS_User_Guide.pdf#subsection.6.4.3'    ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:GAMMA':                           $this->collectData[]='FDS_User_Guide.pdf#subsection.11.1.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:GRAVITATIONAL_DEPOSITION':        $this->collectData[]='FDS_User_Guide.pdf#section.12.5'        ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:GRAVITATIONAL_SETTLING':          $this->collectData[]='FDS_User_Guide.pdf#section.12.5'        ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:GROUND_LEVEL':                    $this->collectData[]='FDS_User_Guide.pdf#section.9.6'         ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:GVEC':                            $this->collectData[]='FDS_User_Guide.pdf#subsection.6.4.6'    ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:H_F_REFERENCE_TEMPERATURE':       $this->collectData[]='FDS_User_Guide.pdf#subsection.16.10.18' ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:HUMIDITY':                        $this->collectData[]='FDS_User_Guide.pdf#subsection.11.1.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:INITIAL_UNMIXED_FRACTION':        $this->collectData[]='FDS_User_Guide.pdf#subsection.12.1.3'   ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:LAPSE_RATE':                      $this->collectData[]='FDS_User_Guide.pdf#section.9.6'         ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:MAX_CHEMISTRY_ITERATIONS':        $this->collectData[]='FDS_User_Guide.pdf#section.12.4'        ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:MAX_LEAK_PATHS':                  $this->collectData[]='FDS_User_Guide.pdf#subsection.9.3.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:MAXIMUM_VISIBILITY':              $this->collectData[]='FDS_User_Guide.pdf#subsection.16.10.2'  ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:MEAN_FORCING':                    $this->collectData[]='FDS_User_Guide.pdf#subsection.6.4.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:MPI_TIMEOUT':                     $this->collectData[]='FDS_User_Guide.pdf#subsection.16.10.19' ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:NOISE':                           $this->collectData[]='FDS_User_Guide.pdf#subsection.6.4.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:NOISE_VELOCITY':                  $this->collectData[]='FDS_User_Guide.pdf#subsection.6.4.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:NO_EVACUATION':                   $this->collectData[]='FDS_User_Guide.pdf#Reference[53]'       ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:OVERWRITE':                       $this->collectData[]='FDS_User_Guide.pdf#subsection.6.4.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:PARTICLE_CFL':                    $this->collectData[]='FDS_User_Guide.pdf#subsection.6.4.9'    ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:PARTICLE_CFL_MAX':                $this->collectData[]='FDS_User_Guide.pdf#subsection.6.4.9'    ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:POROUS_FLOOR':                    $this->collectData[]='FDS_User_Guide.pdf#subsection.15.3.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:PR':                              $this->collectData[]='FDS_User_Guide.pdf#subsection.6.4.8'    ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:PROJECTION':                      $this->collectData[]='FDS_User_Guide.pdf#Formalprojection'    ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:P_INF':                           $this->collectData[]='FDS_User_Guide.pdf#subsection.6.4.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:RAMP_GX':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.6.4.6'    ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:RAMP_GY':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.6.4.6'    ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:RAMP_GZ':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.6.4.6'    ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:RESTART':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.6.4.4'    ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:RESTART_CHID':                    $this->collectData[]='FDS_User_Guide.pdf#subsection.6.4.4'    ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:RICHARDSON_ERROR_TOLERANCE':      $this->collectData[]='FDS_User_Guide.pdf#section.12'          ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:RUN_AVG_FAC':                     $this->collectData[]='FDS_User_Guide.pdf#subsection.14.3.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:SC':                              $this->collectData[]='FDS_User_Guide.pdf#subsection.6.4.8'    ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:SECOND_ORDER_INTERPOLATED_BOUND': $this->collectData[]='FDS_User_Guide.pdf#subsection.6.4.10'   ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:SHARED_FILE_SYSTEM':              $this->collectData[]='FDS_User_Guide.pdf#subsection.6.3.3'    ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:SMOKE_ALBEDO':                    $this->collectData[]='FDS_User_Guide.pdf#Reference[2]'        ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:SOLID_PHASE_ONLY':                $this->collectData[]='FDS_User_Guide.pdf#section.8.6'         ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:STRATIFICATION':                  $this->collectData[]='FDS_User_Guide.pdf#section.9.6'         ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:SUPPRESSION':                     $this->collectData[]='FDS_User_Guide.pdf#subsection.12.1.4'   ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:TEXTURE_ORIGIN':                  $this->collectData[]='FDS_User_Guide.pdf#subsection.7.4.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:THERMOPHORETIC_DEPOSITION':       $this->collectData[]='FDS_User_Guide.pdf#section.12.5'        ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:THICKEN_OBSTRUCTIONS':            $this->collectData[]='FDS_User_Guide.pdf#subsection.7.2.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:TMPA':                            $this->collectData[]='FDS_User_Guide.pdf#subsection.6.4.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:TURBULENCE_MODEL':                $this->collectData[]='FDS_User_Guide.pdf#subsection.6.4.8'    ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:TURBULENT_DEPOSITION':            $this->collectData[]='FDS_User_Guide.pdf#section.12.5'        ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:U0':		                     $this->collectData[]='FDS_User_Guide.pdf#subsection.6.4.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:V0':			                 $this->collectData[]='FDS_User_Guide.pdf#subsection.6.4.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:W0':				             $this->collectData[]='FDS_User_Guide.pdf#subsection.6.4.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:VISIBILITY_FACTOR':               $this->collectData[]='FDS_User_Guide.pdf#subsection.16.10.2'  ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:VN_MAX':                          $this->collectData[]='FDS_User_Guide.pdf#subsection.6.4.9'    ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:VN_MIN':                          $this->collectData[]='FDS_User_Guide.pdf#subsection.6.4.9'    ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:Y_CO2_INFTY':                     $this->collectData[]='FDS_User_Guide.pdf#subsection.12.1.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&MISC:Y_O2_INFTY':                      $this->collectData[]='FDS_User_Guide.pdf#subsection.12.1.1'   ; $this->returnPodsumowanie('fdsManual');

			case '&MULT:&MULT':                           $this->collectData[]='FDS_User_Guide.pdf#section.7.5'         ; $this->returnPodsumowanie('fdsManual');

			case '&OBST:&OBST':                           $this->collectData[]='FDS_User_Guide.pdf#section.7.2'         ; $this->returnPodsumowanie('fdsManual');
			case '&OBST:ALLOW_VENT':                      $this->collectData[]='FDS_User_Guide.pdf#subsection.7.2.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&OBST:BNDF_FACE':                       $this->collectData[]='FDS_User_Guide.pdf#section.16.5'        ; $this->returnPodsumowanie('fdsManual');
			case '&OBST:BNDF_OBST':                       $this->collectData[]='FDS_User_Guide.pdf#section.16.5'        ; $this->returnPodsumowanie('fdsManual');
			case '&OBST:BULK_DENSITY':                    $this->collectData[]='FDS_User_Guide.pdf#subsection.8.5.8'    ; $this->returnPodsumowanie('fdsManual');
			case '&OBST:COLOR':                           $this->collectData[]='FDS_User_Guide.pdf#subsection.7.2.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&OBST:CTRL_ID':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.15.4.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&OBST:DEVC_ID':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.15.4.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&OBST:EVACUATION':                      $this->collectData[]='FDS_User_Guide.pdf#Reference[53]'       ; $this->returnPodsumowanie('fdsManual');
			case '&OBST:ID':                              $this->collectData[]='FDS_User_Guide.pdf#subsection.7.2.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&OBST:MESH_ID':                         $this->collectData[]='FDS_User_Guide.pdf#Reference[53]'       ; $this->returnPodsumowanie('fdsManual');
			case '&OBST:MULT_ID':                         $this->collectData[]='FDS_User_Guide.pdf#section.7.5'         ; $this->returnPodsumowanie('fdsManual');
			case '&OBST:OUTLINE':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.7.2.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&OBST:OVERLAY':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.7.2.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&OBST:PERMIT_HOLE':                     $this->collectData[]='FDS_User_Guide.pdf#subsection.7.2.6'    ; $this->returnPodsumowanie('fdsManual');
			case '&OBST:PROP_ID':                         $this->collectData[]='FDS_User_Guide.pdf#Reference[2]'        ; $this->returnPodsumowanie('fdsManual');
			case '&OBST:REMOVABLE':                       $this->collectData[]='FDS_User_Guide.pdf#subsection.7.2.6'    ; $this->returnPodsumowanie('fdsManual');
			case '&OBST:RGB':                             $this->collectData[]='FDS_User_Guide.pdf#subsection.7.2.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&OBST:SURF_ID':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.7.2.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&OBST:SURF_ID6':                        $this->collectData[]='FDS_User_Guide.pdf#subsection.7.2.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&OBST:SURF_IDS':                        $this->collectData[]='FDS_User_Guide.pdf#subsection.7.2.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&OBST:TEXTURE_ORIGIN':                  $this->collectData[]='FDS_User_Guide.pdf#subsection.7.4.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&OBST:THICKEN':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.7.2.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&OBST:TRANSPARENCY':                    $this->collectData[]='FDS_User_Guide.pdf#subsection.7.2.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&OBST:XB':                              $this->collectData[]='FDS_User_Guide.pdf#subsection.7.2.1'    ; $this->returnPodsumowanie('fdsManual');

			case '&PART:&PART':                           $this->collectData[]='FDS_User_Guide.pdf#section.17.17'		  ; $this->returnPodsumowanie('fdsManual');
			case '&PART:AGE':                             $this->collectData[]='FDS_User_Guide.pdf#section.16.9'        ; $this->returnPodsumowanie('fdsManual');
			case '&PART:BREAKUP':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.14.3.4'   ; $this->returnPodsumowanie('fdsManual');
			case '&PART:BREAKUP_CNF_RAMP_ID':             $this->collectData[]='FDS_User_Guide.pdf#subsection.14.3.4'   ; $this->returnPodsumowanie('fdsManual');
			case '&PART:BREAKUP_DISTRIBUTION':            $this->collectData[]='FDS_User_Guide.pdf#subsection.14.3.4'   ; $this->returnPodsumowanie('fdsManual');
			case '&PART:BREAKUP_GAMMA_D':                 $this->collectData[]='FDS_User_Guide.pdf#subsection.14.3.4'   ; $this->returnPodsumowanie('fdsManual');
			case '&PART:BREAKUP_RATIO':                   $this->collectData[]='FDS_User_Guide.pdf#subsection.14.3.4'   ; $this->returnPodsumowanie('fdsManual');
			case '&PART:BREAKUP_SIGMA_D':                 $this->collectData[]='FDS_User_Guide.pdf#subsection.14.3.4'   ; $this->returnPodsumowanie('fdsManual');
			case '&PART:CHECK_DISTRIBUTION':              $this->collectData[]='FDS_User_Guide.pdf#subsection.14.3.3'   ; $this->returnPodsumowanie('fdsManual');
			case '&PART:CNF_RAMP_ID':                     $this->collectData[]='FDS_User_Guide.pdf#subsection.14.3.3'   ; $this->returnPodsumowanie('fdsManual');
			case '&PART:COLOR':                           $this->collectData[]='FDS_User_Guide.pdf#section.16.9'        ; $this->returnPodsumowanie('fdsManual');
			case '&PART:COMPLEX_REFRACTIVE_INDEX':        $this->collectData[]='FDS_User_Guide.pdf#subsection.14.3.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&PART:CTRL_ID':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.14.5.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&PART:DENSE_VOLUME_FRACTION':           $this->collectData[]='FDS_User_Guide.pdf#subsection.14.4.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&PART:DEVC_ID':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.14.5.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&PART:DIAMETER':                        $this->collectData[]='FDS_User_Guide.pdf#subsection.14.3.3'   ; $this->returnPodsumowanie('fdsManual');
			case '&PART:DISTRIBUTION':                    $this->collectData[]='FDS_User_Guide.pdf#subsection.14.3.3'   ; $this->returnPodsumowanie('fdsManual');
			case '&PART:DRAG_COEFFICIENT':                $this->collectData[]='FDS_User_Guide.pdf#subsection.14.4.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&PART:DRAG_LAW':                        $this->collectData[]='FDS_User_Guide.pdf#subsection.14.4.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&PART:FREE_AREA_FRACTION':              $this->collectData[]='FDS_User_Guide.pdf#subsection.14.4.8'   ; $this->returnPodsumowanie('fdsManual');
			case '&PART:GAMMA_D':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.14.3.3'   ; $this->returnPodsumowanie('fdsManual');
			case '&PART:HEAT_OF_COMBUSTION':              $this->collectData[]='FDS_User_Guide.pdf#subsection.14.3.5'   ; $this->returnPodsumowanie('fdsManual');
			case '&PART:HORIZONTAL_VELOCITY':             $this->collectData[]='FDS_User_Guide.pdf#subsection.14.6.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&PART:ID':                              $this->collectData[]='FDS_User_Guide.pdf#section.14.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&PART:INITIAL_TEMPERATURE':             $this->collectData[]='FDS_User_Guide.pdf#subsection.14.3.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&PART:MASSLESS':                        $this->collectData[]='FDS_User_Guide.pdf#section.14.2'        ; $this->returnPodsumowanie('fdsManual');
			case '&PART:MAXIMUM_DIAMETER':                $this->collectData[]='FDS_User_Guide.pdf#subsection.14.3.3'   ; $this->returnPodsumowanie('fdsManual');
			case '&PART:MINIMUM_DIAMETER':                $this->collectData[]='FDS_User_Guide.pdf#subsection.14.3.3'   ; $this->returnPodsumowanie('fdsManual');
			case '&PART:MONODISPERSE':                    $this->collectData[]='FDS_User_Guide.pdf#subsection.14.3.3'   ; $this->returnPodsumowanie('fdsManual');
			case '&PART:N_STRATA':                        $this->collectData[]='FDS_User_Guide.pdf#subsection.14.3.3'   ; $this->returnPodsumowanie('fdsManual');
			case '&PART:ORIENTATION':                     $this->collectData[]='FDS_User_Guide.pdf#section.14.4'        ; $this->returnPodsumowanie('fdsManual');
			case '&PART:PERMEABILITY':                    $this->collectData[]='FDS_User_Guide.pdf#subsection.14.4.7'   ; $this->returnPodsumowanie('fdsManual');
			case '&PART:PROP_ID':                         $this->collectData[]='FDS_User_Guide.pdf#section.14.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&PART:QUANTITIES':                      $this->collectData[]='FDS_User_Guide.pdf#section.16.9'        ; $this->returnPodsumowanie('fdsManual');
			case '&PART:QUANTITIES_SPEC_ID':              $this->collectData[]='FDS_User_Guide.pdf#section.16.9'        ; $this->returnPodsumowanie('fdsManual');
			case '&PART:RADIATIVE_PROPERTY_TABLE':        $this->collectData[]='FDS_User_Guide.pdf#subsection.14.3.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&PART:REAL_REFRACTIVE_INDEX':           $this->collectData[]='FDS_User_Guide.pdf#subsection.14.3.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&PART:RGB':                             $this->collectData[]='FDS_User_Guide.pdf#section.16.9'        ; $this->returnPodsumowanie('fdsManual');
			case '&PART:SAMPLING_FACTOR':                 $this->collectData[]='FDS_User_Guide.pdf#section.16.9'        ; $this->returnPodsumowanie('fdsManual');
			case '&PART:SIGMA_D':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.14.3.3'   ; $this->returnPodsumowanie('fdsManual');
			case '&PART:SPEC_ID':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.14.3.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&PART:STATIC':                          $this->collectData[]='FDS_User_Guide.pdf#section.14.4'        ; $this->returnPodsumowanie('fdsManual');
			case '&PART:SURFACE_TENSION':                 $this->collectData[]='FDS_User_Guide.pdf#subsection.14.3.4'   ; $this->returnPodsumowanie('fdsManual');
			case '&PART:SURF_ID':                         $this->collectData[]='FDS_User_Guide.pdf#section.14.4'        ; $this->returnPodsumowanie('fdsManual');
			case '&PART:TURBULENT_DISPERSION':            $this->collectData[]='FDS_User_Guide.pdf#section.14.2'        ; $this->returnPodsumowanie('fdsManual');
			case '&PART:VERTICAL_VELOCITY':               $this->collectData[]='FDS_User_Guide.pdf#subsection.14.6.1'   ; $this->returnPodsumowanie('fdsManual');

			case '&PRES:&PRES':                           $this->collectData[]='FDS_User_Guide.pdf#section.6.6'         ; $this->returnPodsumowanie('fdsManual');
			case '&PRES:CHECK_POISSON':                   $this->collectData[]='FDS_User_Guide.pdf#section.6.6'         ; $this->returnPodsumowanie('fdsManual');
			case '&PRES:FISHPAK_BC':                      $this->collectData[]='FDS_User_Guide.pdf#section.6.6'         ; $this->returnPodsumowanie('fdsManual');
			case '&PRES:MAX_PRESSURE_ITERATIONS':         $this->collectData[]='FDS_User_Guide.pdf#section.6.6'         ; $this->returnPodsumowanie('fdsManual');
			case '&PRES:PRESSURE_RELAX_TIME':             $this->collectData[]='FDS_User_Guide.pdf#section.6.6'         ; $this->returnPodsumowanie('fdsManual');
			case '&PRES:RELAXATION_FACTOR':               $this->collectData[]='FDS_User_Guide.pdf#section.6.6'         ; $this->returnPodsumowanie('fdsManual');
			case '&PRES:VELOCITY_TOLERANCE':              $this->collectData[]='FDS_User_Guide.pdf#section.6.6'         ; $this->returnPodsumowanie('fdsManual');

			case '&PROF:&PROF':                           $this->collectData[]='FDS_User_Guide.pdf#section.16.3'        ; $this->returnPodsumowanie('fdsManual');
			case '&PROF:ID':                              $this->collectData[]='FDS_User_Guide.pdf#section.16.3'        ; $this->returnPodsumowanie('fdsManual');
			case '&PROF:FORMAT_INDEX':                    $this->collectData[]='FDS_User_Guide.pdf#section.16.3'        ; $this->returnPodsumowanie('fdsManual');
			case '&PROF:IOR':                             $this->collectData[]='FDS_User_Guide.pdf#section.16.3'        ; $this->returnPodsumowanie('fdsManual');
			case '&PROF:QUANTITY':                        $this->collectData[]='FDS_User_Guide.pdf#section.16.3'        ; $this->returnPodsumowanie('fdsManual');
			case '&PROF:XYZ':                             $this->collectData[]='FDS_User_Guide.pdf#section.16.3'        ; $this->returnPodsumowanie('fdsManual');

			case '&PROP:&PROP':                           $this->collectData[]='FDS_User_Guide.pdf#section.15.3'        ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:ACTIVATION_OBSCURATION':          $this->collectData[]='FDS_User_Guide.pdf#subsection.15.3.5'   ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:ACTIVATION_TEMPERATURE':          $this->collectData[]='FDS_User_Guide.pdf#subsection.15.3.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:ALPHA_C':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.15.3.5'   ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:ALPHA_E':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.15.3.5'   ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:BEAD_DENSITY':                    $this->collectData[]='FDS_User_Guide.pdf#subsection.16.10.4'  ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:BEAD_DIAMETER':                   $this->collectData[]='FDS_User_Guide.pdf#subsection.16.10.4'  ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:BEAD_EMISSIVITY':                 $this->collectData[]='FDS_User_Guide.pdf#subsection.16.10.4'  ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:BEAD_HEAT_TRANSFER_COEFFICIENT':  $this->collectData[]='FDS_User_Guide.pdf#subsection.16.10.4'  ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:BEAD_SPECIFIC_HEAT':              $this->collectData[]='FDS_User_Guide.pdf#subsection.16.10.4'  ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:BETA_C':                          $this->collectData[]='FDS_User_Guide.pdf#subsection.15.3.5'   ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:BETA_E':                          $this->collectData[]='FDS_User_Guide.pdf#subsection.15.3.5'   ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:CHARACTERISTIC_VELOCITY':         $this->collectData[]='FDS_User_Guide.pdf#subsection.16.10.13' ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:C_FACTOR':                        $this->collectData[]='FDS_User_Guide.pdf#subsection.15.3.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:FLOW_RAMP':                       $this->collectData[]='FDS_User_Guide.pdf#subsection.15.3.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:FLOW_RATE':                       $this->collectData[]='FDS_User_Guide.pdf#subsection.15.3.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:FLOW_TAU':                        $this->collectData[]='FDS_User_Guide.pdf#subsection.15.3.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:GAUGE_EMISSIVITY':                $this->collectData[]='FDS_User_Guide.pdf#subsection.16.10.5'  ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:GAUGE_TEMPERATURE':               $this->collectData[]='FDS_User_Guide.pdf#subsection.16.10.5'  ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:ID':                              $this->collectData[]='FDS_User_Guide.pdf#section.15.3'        ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:INITIAL_TEMPERATURE':             $this->collectData[]='FDS_User_Guide.pdf#subsection.15.3.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:K_FACTOR':                        $this->collectData[]='FDS_User_Guide.pdf#subsection.15.3.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:LENGTH':                          $this->collectData[]='FDS_User_Guide.pdf#subsection.15.3.5'   ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:MASS_FLOW_RATE':                  $this->collectData[]='FDS_User_Guide.pdf#subsection.15.3.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:OFFSET':                          $this->collectData[]='FDS_User_Guide.pdf#subsection.15.3.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:OPERATING_PRESSURE':              $this->collectData[]='FDS_User_Guide.pdf#subsection.15.3.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:ORIFICE_DIAMETER':                $this->collectData[]='FDS_User_Guide.pdf#subsection.15.3.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:P0':			                  $this->collectData[]='FDS_User_Guide.pdf#subsection.15.3.3'   ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:PX':						      $this->collectData[]='FDS_User_Guide.pdf#subsection.15.3.3'   ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:PXX':							  $this->collectData[]='FDS_User_Guide.pdf#subsection.15.3.3'   ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:PARTICLES_PER_SECOND':            $this->collectData[]='FDS_User_Guide.pdf#subsection.15.3.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:PARTICLE_VELOCITY':               $this->collectData[]='FDS_User_Guide.pdf#subsection.15.3.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:PART_ID':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.15.3.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:PDPA_END':                        $this->collectData[]='FDS_User_Guide.pdf#subsection.16.10.6'  ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:PDPA_HISTOGRAM':                  $this->collectData[]='FDS_User_Guide.pdf#subsection.16.10.6'  ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:PDPA_HISTOGRAM_CUMULATIVE':       $this->collectData[]='FDS_User_Guide.pdf#subsection.16.10.6'  ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:PDPA_HISTOGRAM_LIMITS':           $this->collectData[]='FDS_User_Guide.pdf#subsection.16.10.6'  ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:PDPA_HISTOGRAM_NBINS':            $this->collectData[]='FDS_User_Guide.pdf#subsection.16.10.6'  ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:PDPA_INTEGRATE':                  $this->collectData[]='FDS_User_Guide.pdf#subsection.16.10.6'  ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:PDPA_M':                          $this->collectData[]='FDS_User_Guide.pdf#subsection.16.10.6'  ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:PDPA_N':                          $this->collectData[]='FDS_User_Guide.pdf#subsection.16.10.6'  ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:PDPA_NORMALIZE':                  $this->collectData[]='FDS_User_Guide.pdf#subsection.16.10.6'  ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:PDPA_RADIUS':                     $this->collectData[]='FDS_User_Guide.pdf#subsection.16.10.6'  ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:PDPA_START':                      $this->collectData[]='FDS_User_Guide.pdf#subsection.16.10.6'  ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:PRESSURE_RAMP':                   $this->collectData[]='FDS_User_Guide.pdf#subsection.15.3.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:QUANTITY':                        $this->collectData[]='FDS_User_Guide.pdf#subsection.15.3.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:RTI':                             $this->collectData[]='FDS_User_Guide.pdf#subsection.15.3.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:SMOKEVIEW_ID':                    $this->collectData[]='FDS_User_Guide.pdf#subsection.15.7.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:SMOKEVIEW_PARAMETERS':            $this->collectData[]='FDS_User_Guide.pdf#subsection.15.7.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:SPEC_ID':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.15.3.5'   ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:SPRAY_ANGLE':                     $this->collectData[]='FDS_User_Guide.pdf#subsection.15.3.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:SPRAY_PATTERN_BETA':              $this->collectData[]='FDS_User_Guide.pdf#subsection.15.3.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:SPRAY_PATTERN_MU':                $this->collectData[]='FDS_User_Guide.pdf#subsection.15.3.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:SPRAY_PATTERN_SHAPE':             $this->collectData[]='FDS_User_Guide.pdf#subsection.15.3.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:SPRAY_PATTERN_TABLE':             $this->collectData[]='FDS_User_Guide.pdf#subsection.15.3.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&PROP:VELOCITY_COMPONENT':              $this->collectData[]='FDS_User_Guide.pdf#subsection.15.3.3'   ; $this->returnPodsumowanie('fdsManual');

			case '&RADI:&RADI':                           $this->collectData[]='FDS_User_Guide.pdf#section.13.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&RADI:ANGLE_INCREMENT':                 $this->collectData[]='FDS_User_Guide.pdf#subsection.13.1.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&RADI:BAND_LIMITS':                     $this->collectData[]='FDS_User_Guide.pdf#subsection.13.2.3'   ; $this->returnPodsumowanie('fdsManual');
			case '&RADI:KAPPA0':                          $this->collectData[]='FDS_User_Guide.pdf#subsection.13.2.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&RADI:MIE_MINIMUM_DIAMETER':            $this->collectData[]='FDS_User_Guide.pdf#subsection.13.2.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&RADI:MIE_MAXIMUM_DIAMETER':            $this->collectData[]='FDS_User_Guide.pdf#subsection.13.2.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&RADI:MIE_NDG':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.13.2.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&RADI:NMIEANG':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.13.2.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&RADI:NUMBER_INITIAL_ITERATIONS':       $this->collectData[]='FDS_User_Guide.pdf#subsection.13.1.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&RADI:NUMBER_RADIATION_ANGLES':         $this->collectData[]='FDS_User_Guide.pdf#subsection.13.1.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&RADI:PATH_LENGTH':                     $this->collectData[]='FDS_User_Guide.pdf#subsection.13.2.3'   ; $this->returnPodsumowanie('fdsManual');
			case '&RADI:RADIATION':                       $this->collectData[]='FDS_User_Guide.pdf#section.13.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&RADI:RADTMP':                          $this->collectData[]='FDS_User_Guide.pdf#subsection.13.2.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&RADI:TIME_STEP_INCREMENT':             $this->collectData[]='FDS_User_Guide.pdf#subsection.13.1.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&RADI:WIDE_BAND_MODEL':                 $this->collectData[]='FDS_User_Guide.pdf#subsection.13.2.3'   ; $this->returnPodsumowanie('fdsManual');

			case '&RAMP:&RAMP':                           $this->collectData[]='FDS_User_Guide.pdf#section.17.22'       ; $this->returnPodsumowanie('fdsManual');
			case '&RAMP:CTRL_ID':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.15.6.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&RAMP:DEVC_ID':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.15.6.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&RAMP:F':                               $this->collectData[]='FDS_User_Guide.pdf#Chapter10'           ; $this->returnPodsumowanie('fdsManual');
			case '&RAMP:ID':                              $this->collectData[]='FDS_User_Guide.pdf#Chapter10'           ; $this->returnPodsumowanie('fdsManual');
			case '&RAMP:NUMBER_INTERPOLATION_POINTS':     $this->collectData[]='FDS_User_Guide.pdf#Chapter10'           ; $this->returnPodsumowanie('fdsManual');
			case '&RAMP:T':                               $this->collectData[]='FDS_User_Guide.pdf#Chapter10'           ; $this->returnPodsumowanie('fdsManual');
			case '&RAMP:X':                               $this->collectData[]='FDS_User_Guide.pdf#subsection.6.4.6'    ; $this->returnPodsumowanie('fdsManual');

			case '&REAC:&REAC':                           $this->collectData[]='FDS_User_Guide.pdf#section.17.23'       ; $this->returnPodsumowanie('fdsManual');
			case '&REAC:A':                               $this->collectData[]='FDS_User_Guide.pdf#section.12.3'        ; $this->returnPodsumowanie('fdsManual');
			case '&REAC:AUTO_IGNITION_TEMPERATURE':       $this->collectData[]='FDS_User_Guide.pdf#subsection.12.1.4'   ; $this->returnPodsumowanie('fdsManual');
			case '&REAC:C':                               $this->collectData[]='FDS_User_Guide.pdf#subsection.12.1.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&REAC:CHECK_ATOM_BALANCE':              $this->collectData[]='FDS_User_Guide.pdf#section.12.2'        ; $this->returnPodsumowanie('fdsManual');
			case '&REAC:CO_YIELD':                        $this->collectData[]='FDS_User_Guide.pdf#subsection.12.1.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&REAC:CRITICAL_FLAME_TEMPERATURE':      $this->collectData[]='FDS_User_Guide.pdf#subsection.12.1.4'   ; $this->returnPodsumowanie('fdsManual');
			case '&REAC:E':                               $this->collectData[]='FDS_User_Guide.pdf#section.12.3'        ; $this->returnPodsumowanie('fdsManual');
			case '&REAC:EPUMO2':                          $this->collectData[]='FDS_User_Guide.pdf#subsection.12.1.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&REAC:EQUATION':                        $this->collectData[]='FDS_User_Guide.pdf#subsection.12.2.3'   ; $this->returnPodsumowanie('fdsManual');
			case '&REAC:FORMULA':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.12.1.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&REAC:FUEL':                            $this->collectData[]='FDS_User_Guide.pdf#subsection.12.1.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&REAC:FUEL_RADCAL_ID':                  $this->collectData[]='FDS_User_Guide.pdf#subsection.12.1.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&REAC:H':                               $this->collectData[]='FDS_User_Guide.pdf#subsection.12.1.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&REAC:HEAT_OF_COMBUSTION':              $this->collectData[]='FDS_User_Guide.pdf#subsection.12.1.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&REAC:ID':                              $this->collectData[]='FDS_User_Guide.pdf#subsection.12.1.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&REAC:IDEAL':                           $this->collectData[]='FDS_User_Guide.pdf#subsection.12.1.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&REAC:N':                               $this->collectData[]='FDS_User_Guide.pdf#subsection.12.1.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&REAC:NU':                              $this->collectData[]='FDS_User_Guide.pdf#section.12.3'        ; $this->returnPodsumowanie('fdsManual');
			case '&REAC:N_S':                             $this->collectData[]='FDS_User_Guide.pdf#section.12.3'        ; $this->returnPodsumowanie('fdsManual');
			case '&REAC:N_T':                             $this->collectData[]='FDS_User_Guide.pdf#section.12.3'        ; $this->returnPodsumowanie('fdsManual');
			case '&REAC:O':                               $this->collectData[]='FDS_User_Guide.pdf#subsection.12.1.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&REAC:RADIATIVE_FRACTION':              $this->collectData[]='FDS_User_Guide.pdf#subsection.13.1.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&REAC:REAC_ATOM_ERROR':                 $this->collectData[]='FDS_User_Guide.pdf#section.12.2'        ; $this->returnPodsumowanie('fdsManual');
			case '&REAC:REAC_MASS_ERROR':                 $this->collectData[]='FDS_User_Guide.pdf#section.12.2'        ; $this->returnPodsumowanie('fdsManual');
			case '&REAC:SOOT_H_FRACTION':                 $this->collectData[]='FDS_User_Guide.pdf#subsection.12.1.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&REAC:SOOT_YIELD':                      $this->collectData[]='FDS_User_Guide.pdf#subsection.12.1.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&REAC:SPEC_ID_N_S':                     $this->collectData[]='FDS_User_Guide.pdf#section.12.3'        ; $this->returnPodsumowanie('fdsManual');
			case '&REAC:SPEC_ID_NU':                      $this->collectData[]='FDS_User_Guide.pdf#section.12.3'        ; $this->returnPodsumowanie('fdsManual');
			case '&REAC:THIRD_BODY':                      $this->collectData[]='FDS_User_Guide.pdf#section.12.3'        ; $this->returnPodsumowanie('fdsManual');

			case '&SLCF:&SLCF':                           $this->collectData[]='FDS_User_Guide.pdf#section.16.4'        ; $this->returnPodsumowanie('fdsManual');
			case '&SLCF:CELL_CENTERED':                   $this->collectData[]='FDS_User_Guide.pdf#section.16.4'        ; $this->returnPodsumowanie('fdsManual');
			case '&SLCF:EVACUATION':                      $this->collectData[]='FDS_User_Guide.pdf#Reference[53]'       ; $this->returnPodsumowanie('fdsManual');
			case '&SLCF:MAXIMUM_VALUE':                   $this->collectData[]='FDS_User_Guide.pdf#Reference[2]'        ; $this->returnPodsumowanie('fdsManual');
			case '&SLCF:MESH_NUMBER':                     $this->collectData[]='FDS_User_Guide.pdf#section.16.4'        ; $this->returnPodsumowanie('fdsManual');
			case '&SLCF:MINIMUM_VALUE':                   $this->collectData[]='FDS_User_Guide.pdf#Reference[2]'        ; $this->returnPodsumowanie('fdsManual');
			case '&SLCF:PART_ID':                         $this->collectData[]='FDS_User_Guide.pdf#section.16.12'       ; $this->returnPodsumowanie('fdsManual');
			case '&SLCF:PBX':			               $this->collectData[]='FDS_User_Guide.pdf#section.16.4'        ; $this->returnPodsumowanie('fdsManual');
			case '&SLCF:PBY':				           $this->collectData[]='FDS_User_Guide.pdf#section.16.4'        ; $this->returnPodsumowanie('fdsManual');
			case '&SLCF:PBZ':					       $this->collectData[]='FDS_User_Guide.pdf#section.16.4'        ; $this->returnPodsumowanie('fdsManual');
			case '&SLCF:QUANTITY':                        $this->collectData[]='FDS_User_Guide.pdf#section.16.12'       ; $this->returnPodsumowanie('fdsManual');
			case '&SLCF:QUANTITY2':                       $this->collectData[]='FDS_User_Guide.pdf#section.16.12'       ; $this->returnPodsumowanie('fdsManual');
			case '&SLCF:SPEC_ID':                         $this->collectData[]='FDS_User_Guide.pdf#section.16.12'       ; $this->returnPodsumowanie('fdsManual');
			case '&SLCF:VECTOR':                          $this->collectData[]='FDS_User_Guide.pdf#section.16.4'        ; $this->returnPodsumowanie('fdsManual');
			case '&SLCF:VELO_INDEX':                      $this->collectData[]='FDS_User_Guide.pdf#subsection.16.10.17' ; $this->returnPodsumowanie('fdsManual');
			case '&SLCF:XB':                              $this->collectData[]='FDS_User_Guide.pdf#section.16.4'        ; $this->returnPodsumowanie('fdsManual');

			case '&SPEC:&SPEC':                           $this->collectData[]='FDS_User_Guide.pdf#section.17.25'		  ; $this->returnPodsumowanie('fdsManual');
			case '&SPEC:AEROSOL':                         $this->collectData[]='FDS_User_Guide.pdf#section.12.5'        ; $this->returnPodsumowanie('fdsManual');
			case '&SPEC:ALIAS':                           $this->collectData[]='FDS_User_Guide.pdf#subsection.11.1.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&SPEC:BACKGROUND':                      $this->collectData[]='FDS_User_Guide.pdf#section.11'          ; $this->returnPodsumowanie('fdsManual');
			case '&SPEC:CONDUCTIVITY':                    $this->collectData[]='FDS_User_Guide.pdf#subsection.11.1.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&SPEC:CONDUCTIVITY_SOLID':              $this->collectData[]='FDS_User_Guide.pdf#section.12.5'        ; $this->returnPodsumowanie('fdsManual');
			case '&SPEC:DENSITY_LIQUID':                  $this->collectData[]='FDS_User_Guide.pdf#subsection.14.3.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&SPEC:DENSITY_SOLID':                   $this->collectData[]='FDS_User_Guide.pdf#section.12.5'        ; $this->returnPodsumowanie('fdsManual');
			case '&SPEC:DIFFUSIVITY':                     $this->collectData[]='FDS_User_Guide.pdf#subsection.11.1.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&SPEC:ENTHALPY_OF_FORMATION':           $this->collectData[]='FDS_User_Guide.pdf#subsection.14.3.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&SPEC:EPSILONKLJ':                      $this->collectData[]='FDS_User_Guide.pdf#subsection.11.1.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&SPEC:FIC_CONCENTRATION':               $this->collectData[]='FDS_User_Guide.pdf#subsection.16.10.9'  ; $this->returnPodsumowanie('fdsManual');
			case '&SPEC:FLD_LETHAL_DOSE':                 $this->collectData[]='FDS_User_Guide.pdf#subsection.16.10.9'  ; $this->returnPodsumowanie('fdsManual');
			case '&SPEC:FORMULA':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.11.1.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&SPEC:HEAT_OF_VAPORIZATION':            $this->collectData[]='FDS_User_Guide.pdf#subsection.14.3.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&SPEC:H_V_REFERENCE_TEMPERATURE':       $this->collectData[]='FDS_User_Guide.pdf#subsection.14.3.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&SPEC:ID':                              $this->collectData[]='FDS_User_Guide.pdf#subsection.11.1.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&SPEC:LUMPED_COMPONENT_ONLY':           $this->collectData[]='FDS_User_Guide.pdf#section.11.2'        ; $this->returnPodsumowanie('fdsManual');
			case '&SPEC:MASS_EXTINCTION_COEFFICIENT':     $this->collectData[]='FDS_User_Guide.pdf#subsection.15.3.5'   ; $this->returnPodsumowanie('fdsManual');
			case '&SPEC:MASS_FRACTION':                   $this->collectData[]='FDS_User_Guide.pdf#section.11.2'        ; $this->returnPodsumowanie('fdsManual');
			case '&SPEC:MASS_FRACTION_0':                 $this->collectData[]='FDS_User_Guide.pdf#subsection.11.1.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&SPEC:MEAN_DIAMETER':                   $this->collectData[]='FDS_User_Guide.pdf#section.12.5'        ; $this->returnPodsumowanie('fdsManual');
			case '&SPEC:MELTING_TEMPERATURE':             $this->collectData[]='FDS_User_Guide.pdf#subsection.14.3.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&SPEC:MW':                              $this->collectData[]='FDS_User_Guide.pdf#subsection.11.1.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&SPEC:PR_GAS':                          $this->collectData[]='FDS_User_Guide.pdf#subsection.11.1.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&SPEC:PRIMITIVE':                       $this->collectData[]='FDS_User_Guide.pdf#subsection.11.1.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&SPEC:RADCAL_ID':                       $this->collectData[]='FDS_User_Guide.pdf#subsection.11.1.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&SPEC:RAMP_CP':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.11.1.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&SPEC:RAMP_CP_L':                       $this->collectData[]='FDS_User_Guide.pdf#subsection.14.3.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&SPEC:RAMP_D':                          $this->collectData[]='FDS_User_Guide.pdf#subsection.11.1.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&SPEC:RAMP_G_F':                        $this->collectData[]='FDS_User_Guide.pdf#subsection.11.1.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&SPEC:RAMP_K':                          $this->collectData[]='FDS_User_Guide.pdf#subsection.11.1.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&SPEC:RAMP_MU':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.11.1.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&SPEC:REFERENCE_ENTHALPY':              $this->collectData[]='FDS_User_Guide.pdf#subsection.11.1.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&SPEC:REFERENCE_TEMPERATURE':           $this->collectData[]='FDS_User_Guide.pdf#subsection.11.1.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&SPEC:SIGMALJ':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.11.1.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&SPEC:SPEC_ID':                         $this->collectData[]='FDS_User_Guide.pdf#section.11.2'        ; $this->returnPodsumowanie('fdsManual');
			case '&SPEC:SPECIFIC_HEAT':                   $this->collectData[]='FDS_User_Guide.pdf#subsection.11.1.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&SPEC:SPECIFIC_HEAT_LIQUID':            $this->collectData[]='FDS_User_Guide.pdf#subsection.14.3.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&SPEC:VAPORIZATION_TEMPERATURE':        $this->collectData[]='FDS_User_Guide.pdf#subsection.14.3.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&SPEC:VISCOSITY':                       $this->collectData[]='FDS_User_Guide.pdf#subsection.11.1.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&SPEC:VOLUME_FRACTION':                 $this->collectData[]='FDS_User_Guide.pdf#section.11.2'        ; $this->returnPodsumowanie('fdsManual');

			case '&SURF:&SURF':                           $this->collectData[]='FDS_User_Guide.pdf#section.7.1'         ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:ADIABATIC':                       $this->collectData[]='FDS_User_Guide.pdf#subsection.8.2.3'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:BACKING':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.8.3.3'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:BURN_AWAY':                       $this->collectData[]='FDS_User_Guide.pdf#subsection.8.5.8'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:CELL_SIZE_FACTOR':                $this->collectData[]='FDS_User_Guide.pdf#subsection.8.3.8'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:C_FORCED_CONSTANT':               $this->collectData[]='FDS_User_Guide.pdf#subsection.8.2.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:C_FORCED_PR_EXP':                 $this->collectData[]='FDS_User_Guide.pdf#subsection.8.2.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:C_FORCED_RE':                     $this->collectData[]='FDS_User_Guide.pdf#subsection.8.2.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:C_FORCED_RE_EXP':                 $this->collectData[]='FDS_User_Guide.pdf#subsection.8.2.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:C_HORIZONTAL':                    $this->collectData[]='FDS_User_Guide.pdf#subsection.8.2.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:C_VERTICAL':                      $this->collectData[]='FDS_User_Guide.pdf#subsection.8.2.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:COLOR':                           $this->collectData[]='FDS_User_Guide.pdf#section.7.4'         ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:CONVECTION_LENGTH_SCALE':         $this->collectData[]='FDS_User_Guide.pdf#subsection.8.2.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:CONVECTIVE_HEAT_FLUX':            $this->collectData[]='FDS_User_Guide.pdf#subsection.8.2.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:CONVERT_VOLUME_TO_MASS':          $this->collectData[]='FDS_User_Guide.pdf#subsection.9.1.6'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:DEFAULT':                         $this->collectData[]='FDS_User_Guide.pdf#section.7.1'         ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:DT_INSERT':                       $this->collectData[]='FDS_User_Guide.pdf#subsection.14.5.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:EMISSIVITY':                      $this->collectData[]='FDS_User_Guide.pdf#subsection.8.2.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:EMISSIVITY_BACK':                 $this->collectData[]='FDS_User_Guide.pdf#subsection.8.3.3'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:EVAC_DEFAULT':                    $this->collectData[]='FDS_User_Guide.pdf#Reference[53]'       ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:EXTERNAL_FLUX':                   $this->collectData[]='FDS_User_Guide.pdf#section.8.6'         ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:E_COEFFICIENT':                   $this->collectData[]='FDS_User_Guide.pdf#section.14.6'        ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:FREE_SLIP':                       $this->collectData[]='FDS_User_Guide.pdf#subsection.9.1.7'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:GEOMETRY':                        $this->collectData[]='FDS_User_Guide.pdf#subsection.8.3.7'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:HEAT_OF_VAPORIZATION':            $this->collectData[]='FDS_User_Guide.pdf#subsection.8.4.3'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:HEAT_TRANSFER_COEFFICIENT':       $this->collectData[]='FDS_User_Guide.pdf#subsection.8.2.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:HEAT_TRANSFER_MODEL':             $this->collectData[]='FDS_User_Guide.pdf#subsection.8.2.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:HRRPUA':                          $this->collectData[]='FDS_User_Guide.pdf#subsection.8.4.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:ID':                              $this->collectData[]='FDS_User_Guide.pdf#section.7.1'         ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:IGNITION_TEMPERATURE':            $this->collectData[]='FDS_User_Guide.pdf#subsection.8.4.3'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:INNER_RADIUS':                    $this->collectData[]='FDS_User_Guide.pdf#subsection.14.4.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:INTERNAL_HEAT_SOURCE':            $this->collectData[]='FDS_User_Guide.pdf#subsection.8.3.6'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:LAYER_DIVIDE':                    $this->collectData[]='FDS_User_Guide.pdf#subsection.8.3.5'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:LEAK_PATH':                       $this->collectData[]='FDS_User_Guide.pdf#subsection.9.3.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:LENGTH':                          $this->collectData[]='FDS_User_Guide.pdf#subsection.14.4.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:MASS_FLUX':                       $this->collectData[]='FDS_User_Guide.pdf#subsection.9.1.6'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:MASS_FLUX_TOTAL':                 $this->collectData[]='FDS_User_Guide.pdf#subsection.9.1.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:MASS_FLUX_VAR':                   $this->collectData[]='FDS_User_Guide.pdf#subsection.9.1.9'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:MASS_FRACTION':                   $this->collectData[]='FDS_User_Guide.pdf#subsection.9.1.6'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:MASS_TRANSFER_COEFFICIENT':       $this->collectData[]='FDS_User_Guide.pdf#subsection.8.5.7'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:MATL_ID':                         $this->collectData[]='FDS_User_Guide.pdf#section.8.5'         ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:MATL_MASS_FRACTION':              $this->collectData[]='FDS_User_Guide.pdf#section.8.5'         ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:MINIMUM_LAYER_THICKNESS':         $this->collectData[]='FDS_User_Guide.pdf#subsection.8.3.8'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:MLRPUA':                          $this->collectData[]='FDS_User_Guide.pdf#subsection.8.4.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:N_LAYER_CELLS_MAX':               $this->collectData[]='FDS_User_Guide.pdf#subsection.8.3.8'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:NET_HEAT_FLUX':                   $this->collectData[]='FDS_User_Guide.pdf#subsection.8.2.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:NO_SLIP':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.9.1.7'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:NPPC':                            $this->collectData[]='FDS_User_Guide.pdf#subsection.14.5.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:PARTICLE_MASS_FLUX':              $this->collectData[]='FDS_User_Guide.pdf#subsection.14.5.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:PART_ID':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.14.5.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:PLE':                             $this->collectData[]='FDS_User_Guide.pdf#section.9.6'         ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:PROFILE':                         $this->collectData[]='FDS_User_Guide.pdf#section.9.5'         ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:RADIUS':                          $this->collectData[]='FDS_User_Guide.pdf#subsection.14.4.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:RAMP_EF':                         $this->collectData[]='FDS_User_Guide.pdf#section.10.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:RAMP_MF':                         $this->collectData[]='FDS_User_Guide.pdf#section.10.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:RAMP_PART':                       $this->collectData[]='FDS_User_Guide.pdf#section.10.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:RAMP_Q':                          $this->collectData[]='FDS_User_Guide.pdf#section.10.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:RAMP_T':                          $this->collectData[]='FDS_User_Guide.pdf#section.10.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:RAMP_T_I':                        $this->collectData[]='FDS_User_Guide.pdf#subsection.8.3.4'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:RAMP_V':                          $this->collectData[]='FDS_User_Guide.pdf#section.10.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:RAMP_V_X':                        $this->collectData[]='FDS_User_Guide.pdf#section.10.3'        ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:RAMP_V_Y':                        $this->collectData[]='FDS_User_Guide.pdf#section.10.3'        ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:RAMP_V_Z':                        $this->collectData[]='FDS_User_Guide.pdf#section.10.3'        ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:RGB':                             $this->collectData[]='FDS_User_Guide.pdf#section.7.4'         ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:ROUGHNESS':                       $this->collectData[]='FDS_User_Guide.pdf#subsection.9.1.7'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:SPEC_ID':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.9.1.6'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:SPREAD_RATE':                     $this->collectData[]='FDS_User_Guide.pdf#subsection.8.4.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:STRETCH_FACTOR':                  $this->collectData[]='FDS_User_Guide.pdf#subsection.8.3.8'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:TAU_EF':                          $this->collectData[]='FDS_User_Guide.pdf#section.10.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:TAU_MF':                          $this->collectData[]='FDS_User_Guide.pdf#section.10.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:TAU_PART':                        $this->collectData[]='FDS_User_Guide.pdf#section.10.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:TAU_Q':                           $this->collectData[]='FDS_User_Guide.pdf#section.10.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:TAU_T':                           $this->collectData[]='FDS_User_Guide.pdf#section.10.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:TAU_V':                           $this->collectData[]='FDS_User_Guide.pdf#section.10.1'        ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:TEXTURE_HEIGHT':                  $this->collectData[]='FDS_User_Guide.pdf#subsection.7.4.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:TEXTURE_MAP':                     $this->collectData[]='FDS_User_Guide.pdf#subsection.7.4.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:TEXTURE_WIDTH':                   $this->collectData[]='FDS_User_Guide.pdf#subsection.7.4.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:TGA_ANALYSIS':                    $this->collectData[]='FDS_User_Guide.pdf#subsection.8.6.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:TGA_FINAL_TEMPERATURE':           $this->collectData[]='FDS_User_Guide.pdf#subsection.8.6.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:TGA_HEATING_RATE':                $this->collectData[]='FDS_User_Guide.pdf#subsection.8.6.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:THICKNESS':                       $this->collectData[]='FDS_User_Guide.pdf#section.8.1'         ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:TMP_BACK':                        $this->collectData[]='FDS_User_Guide.pdf#subsection.8.3.4'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:TMP_FRONT':                       $this->collectData[]='FDS_User_Guide.pdf#subsection.8.2.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:TMP_INNER':                       $this->collectData[]='FDS_User_Guide.pdf#subsection.8.3.4'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:TRANSPARENCY':                    $this->collectData[]='FDS_User_Guide.pdf#section.7.4'         ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:VEL':                             $this->collectData[]='FDS_User_Guide.pdf#section.9.1'         ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:VEL_BULK':                        $this->collectData[]='FDS_User_Guide.pdf#section.9.5'         ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:VEL_GRAD':                        $this->collectData[]='FDS_User_Guide.pdf#subsection.9.1.5'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:VEL_T':                           $this->collectData[]='FDS_User_Guide.pdf#subsection.9.1.4'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:VOLUME_FLOW':                     $this->collectData[]='FDS_User_Guide.pdf#section.9.1'         ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:WIDTH':                           $this->collectData[]='FDS_User_Guide.pdf#subsection.14.4.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:XYZ':                             $this->collectData[]='FDS_User_Guide.pdf#subsection.8.4.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&SURF:Z0':                              $this->collectData[]='FDS_User_Guide.pdf#section.9.6'         ; $this->returnPodsumowanie('fdsManual');

			case '&TABL:&TABL':                           $this->collectData[]='FDS_User_Guide.pdf#subsection.15.3.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&TABL:ID':                              $this->collectData[]='FDS_User_Guide.pdf#subsection.15.3.1'   ; $this->returnPodsumowanie('fdsManual');
			case '&TABL:TABLE_DATA':                      $this->collectData[]='FDS_User_Guide.pdf#subsection.15.3.1'   ; $this->returnPodsumowanie('fdsManual');

			case '&TIME:&TIME':                           $this->collectData[]='FDS_User_Guide.pdf#section.6.2'         ; $this->returnPodsumowanie('fdsManual');
			case '&TIME:DT':                              $this->collectData[]='FDS_User_Guide.pdf#subsection.6.2.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&TIME:EVAC_DT_FLOWFIELD':               $this->collectData[]='FDS_User_Guide.pdf#Reference[53]'       ; $this->returnPodsumowanie('fdsManual');
			case '&TIME:EVAC_DT_STEADY_STATE':            $this->collectData[]='FDS_User_Guide.pdf#Reference[53]'       ; $this->returnPodsumowanie('fdsManual');
			case '&TIME:LIMITING_DT_RATIO':               $this->collectData[]='FDS_User_Guide.pdf#section.4.2'         ; $this->returnPodsumowanie('fdsManual');
			case '&TIME:LOCK_TIME_STEP':                  $this->collectData[]='FDS_User_Guide.pdf#subsection.6.2.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&TIME:RESTRICT_TIME_STEP':              $this->collectData[]='FDS_User_Guide.pdf#subsection.6.2.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&TIME:T_BEGIN':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.6.2.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&TIME:T_END':                           $this->collectData[]='FDS_User_Guide.pdf#subsection.6.2.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&TIME:TIME_SHRINK_FACTOR':              $this->collectData[]='FDS_User_Guide.pdf#subsection.6.2.3'    ; $this->returnPodsumowanie('fdsManual');
			case '&TIME:WALL_INCREMENT':                  $this->collectData[]='FDS_User_Guide.pdf#subsection.8.3.8'    ; $this->returnPodsumowanie('fdsManual');

			case '&TRNX:&TRNX':                           $this->collectData[]='FDS_User_Guide.pdf#subsection.6.3.5'    ; $this->returnPodsumowanie('fdsManual');
			case '&TRNX:CC':                              $this->collectData[]='FDS_User_Guide.pdf#subsection.6.3.5'    ; $this->returnPodsumowanie('fdsManual');
			case '&TRNX:IDERIV':                          $this->collectData[]='FDS_User_Guide.pdf#subsection.6.3.5'    ; $this->returnPodsumowanie('fdsManual');
			case '&TRNX:MESH_NUMBER':                     $this->collectData[]='FDS_User_Guide.pdf#subsection.6.3.5'    ; $this->returnPodsumowanie('fdsManual');
			case '&TRNX:PC':                              $this->collectData[]='FDS_User_Guide.pdf#subsection.6.3.5'    ; $this->returnPodsumowanie('fdsManual');

			case '&VENT:&VENT':                           $this->collectData[]='FDS_User_Guide.pdf#section.7.3'         ; $this->returnPodsumowanie('fdsManual');
			case '&VENT:COLOR':                           $this->collectData[]='FDS_User_Guide.pdf#section.7.4'         ; $this->returnPodsumowanie('fdsManual');
			case '&VENT:CTRL_ID':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.15.4.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&VENT:DEVC_ID':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.15.4.2'   ; $this->returnPodsumowanie('fdsManual');
			case '&VENT:DYNAMIC_PRESSURE':                $this->collectData[]='FDS_User_Guide.pdf#section.9.4'         ; $this->returnPodsumowanie('fdsManual');
			case '&VENT:EVACUATION':                      $this->collectData[]='FDS_User_Guide.pdf#Reference[53]'       ; $this->returnPodsumowanie('fdsManual');
			case '&VENT:ID':                              $this->collectData[]='FDS_User_Guide.pdf#subsection.7.3.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&VENT:IOR':                             $this->collectData[]='FDS_User_Guide.pdf#subsection.7.3.4'    ; $this->returnPodsumowanie('fdsManual');
			case '&VENT:L_EDDY':                          $this->collectData[]='FDS_User_Guide.pdf#subsection.9.1.8'    ; $this->returnPodsumowanie('fdsManual');
			case '&VENT:L_EDDY_IJ':                       $this->collectData[]='FDS_User_Guide.pdf#subsection.9.1.8'    ; $this->returnPodsumowanie('fdsManual');
			case '&VENT:MB':                              $this->collectData[]='FDS_User_Guide.pdf#subsection.7.3.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&VENT:MESH_ID':                         $this->collectData[]='FDS_User_Guide.pdf#Reference[53]'       ; $this->returnPodsumowanie('fdsManual');
			case '&VENT:MULT_ID':                         $this->collectData[]='FDS_User_Guide.pdf#section.7.5'         ; $this->returnPodsumowanie('fdsManual');
			case '&VENT:N_EDDY':                          $this->collectData[]='FDS_User_Guide.pdf#subsection.9.1.8'    ; $this->returnPodsumowanie('fdsManual');
			case '&VENT:OUTLINE':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.7.3.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&VENT:PBX':                             $this->collectData[]='FDS_User_Guide.pdf#subsection.7.3.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&VENT:PRESSURE_RAMP':                   $this->collectData[]='FDS_User_Guide.pdf#section.9.4'         ; $this->returnPodsumowanie('fdsManual');
			case '&VENT:REYNOLDS_STRESS':                 $this->collectData[]='FDS_User_Guide.pdf#subsection.9.1.8'    ; $this->returnPodsumowanie('fdsManual');
			case '&VENT:RGB':                             $this->collectData[]='FDS_User_Guide.pdf#section.7.4'         ; $this->returnPodsumowanie('fdsManual');
			case '&VENT:SPREAD_RATE':                     $this->collectData[]='FDS_User_Guide.pdf#subsection.8.4.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&VENT:SURF_ID':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.7.3.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&VENT:TEXTURE_ORIGIN':                  $this->collectData[]='FDS_User_Guide.pdf#subsection.7.4.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&VENT:TMP_EXTERIOR':                    $this->collectData[]='FDS_User_Guide.pdf#subsection.7.3.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&VENT:TMP_EXTERIOR_RAMP':               $this->collectData[]='FDS_User_Guide.pdf#subsection.7.3.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&VENT:TRANSPARENCY':                    $this->collectData[]='FDS_User_Guide.pdf#section.7.4'         ; $this->returnPodsumowanie('fdsManual');
			case '&VENT:UVW':                             $this->collectData[]='FDS_User_Guide.pdf#subsection.9.2.7'    ; $this->returnPodsumowanie('fdsManual');
			case '&VENT:VEL_RMS':                         $this->collectData[]='FDS_User_Guide.pdf#subsection.9.1.8'    ; $this->returnPodsumowanie('fdsManual');
			case '&VENT:XB':                              $this->collectData[]='FDS_User_Guide.pdf#subsection.7.3.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&VENT:XYZ':                             $this->collectData[]='FDS_User_Guide.pdf#subsection.8.4.2'    ; $this->returnPodsumowanie('fdsManual');

			case '&ZONE:&ZONE':                           $this->collectData[]='FDS_User_Guide.pdf#section.9.3'         ; $this->returnPodsumowanie('fdsManual');
			case '&ZONE:ID':                              $this->collectData[]='FDS_User_Guide.pdf#subsection.9.3.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&ZONE:LEAK_AREA':                       $this->collectData[]='FDS_User_Guide.pdf#subsection.9.3.2'    ; $this->returnPodsumowanie('fdsManual');
			case '&ZONE:PERIODIC':                        $this->collectData[]='FDS_User_Guide.pdf#subsection.9.3.1'    ; $this->returnPodsumowanie('fdsManual');
			case '&ZONE:XB':                              $this->collectData[]='FDS_User_Guide.pdf#subsection.9.3.1'    ; $this->returnPodsumowanie('fdsManual');

			$this->collectMsgErrors[0][]="Manual not found for $q"    ; $this->returnPodsumowanie('fdsManual');
		}
	}
	}}}
	public function validate() {/*{{{*/
		$this->rawContentIntoCommandsArray();
		$this->fds2atoms(); # parsujemy RAW do MasterFDS
		$this->isSurfMissingMatls(); 
		$this->addToMatlsLibrary(); 
		$this->addToSurfsLibrary(); 
		$this->validateStructure();
		$this->validateAtoms();
		return $this->returnPodsumowanie('validate');
	}
	/*}}}*/
	public function plainSave() {/*{{{*/
		if(file_put_contents($_SESSION['fdsFile'], $_REQUEST['code'])===FALSE) { $this->collectMsgErrors[0][]='file save failed'; }
		return $this->returnPodsumowanie('plainSave');
	}
	/*}}}*/
	public function flattenSave() {/*{{{*/
		$status=$this->validate();
		if($status['meta']['status']=='fatal') { return $status; }

		$out=[];
		foreach($this->atoms as $arr) {
			$record=$this->arr2fdsRecord($arr);
			$out[]=preg_replace("/ ####.*/", '', $record); # #### FIRE ####
		}

		if(file_put_contents($_SESSION['fdsFile'], join($out))===FALSE) { $this->collectMsgErrors[0][]='file save failed'; }
		return $this->returnPodsumowanie('flattenSave');
	}
	/*}}}*/
	public function groupSave() {/*{{{*/
		$status=$this->validate();
		if($status['meta']['status']=='fatal') { return $status; }
		$this->makeSurfsMatlsFriends(); # wszystkie SURF_ID, MAIL_ID gromadzimy
		#dd2($this->surfsMatlsFriends);
		$this->makeTags();

		$out0=[];
		foreach($this->atoms as $k=>$arr) {
			$keyTagToBeSorted=$arr['tag'].'_'.$arr['rawLineNo'];
			if(preg_match('/^\s*&/', $arr['rawLine'])) { $out0[$keyTagToBeSorted]=$arr['rawLine']; }
		}
		ksort($out0);
		foreach($out0 as $k=>$v) {
			if(preg_match('/^_/', $k)) { 
				$this->collectMsgErrors[0][]="Tagging problem: $k / $v"; return $this->returnPodsumowanie('groupSave');
			}
		}

		$out=[];
		$taggedFound=0;
		foreach(array('GENERAL', 'FIRE',  'GEOMETRY', 'HVAC', 'RESULTS', 'PARTICLES', 'CONTROL', 'MESH', 'UNKNOWN') as $category) {
			$categoryCollect='';
			foreach($out0 as $k=>$v) {
				if(preg_match("/^$category/", $k)) {
					$categoryCollect.="$v\n";
					unset($out0[$k]);
				}
			}
			if(!empty($categoryCollect)) { $out[]="#### ${category} ####\n\n$categoryCollect\n\n"; }
		}
		if(!empty($out0)) {
			$err=join("\n", $out0);
			$this->collectMsgErrors[0][]="Problem with assigning tag categories in: \n$err\n"; 
			return $this->returnPodsumowanie('groupSave');
		}

		if(file_put_contents($_SESSION['fdsFile'], join($out))===FALSE) { $this->collectMsgErrors[0][]='file save failed'; }
		return $this->returnPodsumowanie('groupSave');
	}
	/*}}}*/

}

# kosz/*{{{*/

	# private function poprawTrudneSpacjeRegex($matches) {/*{{{*/
	# 	$srodek=preg_replace('/ /', '', $matches[2]);
	# 	return $matches[1].$srodek.$matches[3];
	# }
/*}}}*/
	# public function poprawTrudneSpacje($line='') {/*{{{*/
	# 	if(empty($line)) { 
	# 		foreach($this->rawContent as $k=>$line) {
	# 			$pattern = '~(.*)(MATL_ID.*?\)=)(.*)~';
	# 			$this->rawContent[$k]=preg_replace_callback($pattern, array($this,'poprawTrudneSpacjeRegex'), $line);
	# 		}
	# 		return join("\n", $this->rawContent);
	# 	} else {
	# 		$pattern = '~(.*)(MATL_ID.*?\)=)(.*)~';
	# 		$line=preg_replace_callback($pattern, array($this,'poprawTrudneSpacjeRegex'), $line);
	# 		return $line;
	# 	}
	# }
/*}}}*/
/*}}}*/
?>

