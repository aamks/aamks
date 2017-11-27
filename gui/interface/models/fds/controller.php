<?php
require_once("MasterFDS.php");
class controller {
	public static function parseRawFileFromFileSubmit() {/*{{{*/
		$raw=file_get_contents('php://input');
		$mFDS=new MasterFDS($raw);
		$mFDS->validateAtoms();
		$result=print_r($mFDS->atoms,1);
		echo json_encode($mFDS->atoms);
		die();
	}
/*}}}*/
	public static function validate() {/*{{{*/
		$raw=file_get_contents('php://input');
		$mFDS=new MasterFDS($raw);
		$status=json_encode($mFDS->validate()); 
		echo $status;
		die();
	}
/*}}}*/
	public static function plainSave() {/*{{{*/
		$raw=file_get_contents('php://input');
		$mFDS=new MasterFDS($raw);
		$status=json_encode($mFDS->plainSave()); 
		echo $status;
		die();
	}
/*}}}*/
	public static function flattenSave() {/*{{{*/
		$raw=file_get_contents('php://input');
		$mFDS=new MasterFDS($raw);
		$status=json_encode($mFDS->flattenSave()); 
		echo $status;
		die();
	}
/*}}}*/
	public static function groupSave() {/*{{{*/
		$raw=file_get_contents('php://input');
		$mFDS=new MasterFDS($raw);
		$status=json_encode($mFDS->groupSave()); 
		echo $status;
		die();
	}
/*}}}*/
}

# To bedzie uproszczone, MasterFDS robi takie wiadomosci sam:

# require_once("server/models/MasterFDS.php");
# 
# class HelpController {
# 	public static function getManualUrl() {
# 		$post=file_get_contents('php://input');
# 		try {
# 			$postObj=json_decode($post);
# 			$token=$postObj->token;
# 		} catch (Exception $e) {
# 			$token="";
# 		}
# 		
# 		$url=MasterFDS::getManualUrl($token);
# 		if(""!==$url) {
# 		echo json_encode(
# 			Array(
# 				"message"=>Array(
# 					"type"=>"success", 
# 					"content"=>"Manual url found"
# 				),
# 				"data"=>Array("url"=>$url)
# 			)
# 		);
# 		
# 		} else {
# 			echo json_encode(
# 				Array(
# 					"message"=>Array(
# 						"type"=>"error", 
# 						"content"=>"Manual url not found"
# 					),
# 					"data"=>Array("url"=>"")
# 				)
# 			);
# 		
# 		}
# 		
# 		die();
# 	}
# }
# 
?>
