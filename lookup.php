<?php

	header("Content-type: text/javascript");
	/*
		you should server side cache this response, especially if your site is active
	*/
	$data = isset($_GET['data'])?$_GET['data']:'';
	if (!empty($data)) {
		$data = explode("|", $data);
		$responses = array();
		if (!empty($data)) {
			foreach ($data as $key) {
				list($instance,$currency,$address) = explode('_',$key);
				$response = get_faircoin($address);
				$responses[$instance] = $response;
			}
		}
		echo 'var FAIRCOINWIDGET_DATA = '.json_encode($responses).';';
	}

	function get_bitcoin($address) {
		$return = array();
		$data = get_request('http://blockchain.info/address/'.$address.'?format=json&limit=0');
		if (!empty($data)) {
			$data = json_decode($data);
			$return += array(
				'count' => (int) $data->n_tx,
				'amount' => (float) $data->total_received/100000000
			);
			return $return;
		}
	}

	function get_faircoin($address) {
		$return = array();
		$data = get_request('https://chain.fair.to/address?address='.$address);
		if (!empty($data))
		{
			//I know that this is dirty way of extracting element contents but i was in hurry :)
			//TODO: Extract elements on nice way.
			$dom = new DOMDocument();
			$dom->loadHTML($data);
			
			$xpath = new DOMXPath($dom);
			$balancediv = $xpath->query('//font[@class="stats"]');
			$balance = strip_tags($dom->saveXML($balancediv->item(1)));

			$tables = $dom->getElementsByTagName('table');
			$rows = $dom->saveXML($tables->item(0));
			$transcations = substr_count(strtolower($rows), '<tr>');

		  	$return += array(
				'count' => (int) $transcations,
				'amount' => (float) $balance
			);
	  		return $return;
		}		
	}	

	function get_request($url,$timeout=4) {
		if (function_exists('curl_version')) {
			$curl = curl_init();
			curl_setopt($curl, CURLOPT_URL, $url);
			curl_setopt($curl, CURLOPT_RETURNTRANSFER,true);
			curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, $timeout);
			curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true);
			curl_setopt($curl, CURLOPT_USERAGENT,'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13');
			$return = curl_exec($curl);
			curl_close($curl);
			return $return;
		} else {
			return @file_get_contents($url);
		}
	}

	function parse($string,$start,$stop) {
		if (!strstr($string, $start)) return;
		if (!strstr($string, $stop)) return;
		$string = substr($string, strpos($string,$start)+strlen($start));
		$string = substr($string, 0, strpos($string,$stop));
		return $string;
	}
