var mainApp = angular.module('mainApp', [])

.controller('MainController', ['$scope','SessionService','apiCallService', function($scope,SessionService,apiCallService){
	$scope.questionLoaded = false;
	$scope.questionData = [];
	$scope.selectedQuestion = {}
	$scope.currentQuestionNumber = 1;
	$scope.prevDisabled = true;
	$scope.nextDisabled = false;
 	$scope.showQuizresult = false;
 	$scope.resultTable = [];
 	$scope.isPageLoading = true;
 	$scope.startTime = null;
 	$scope.endTime = null;
 	$scope.totalTimeTaken = null;

 	var timeFormtting = function(milliSecond){
 		var sec_num = parseInt(milliSecond, 10); // don't forget the second param
	    var hours   = Math.floor(sec_num / 3600);
	    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
	    var seconds = sec_num - (hours * 3600) - (minutes * 60);

	    if (hours   < 10) {hours   = "0"+hours;}
	    if (minutes < 10) {minutes = "0"+minutes;}
	    if (seconds < 10) {seconds = "0"+seconds;}
	    return hours+':'+minutes+':'+seconds;
 	}

	apiCallService.fetchDataFromAPI("assignment.json").then(
		function(response){
			$scope.questionLoaded = true;
			$scope.questionData = response.data;
			$scope.selectedQuestion = $scope.questionData[0];
			$scope.currentQuestionNumber = 1;
			angular.forEach($scope.questionData,function(question){
				question.userResponse = "";
				question.userFormattedResponse = "";
			});
			$scope.isPageLoading = false;
			$scope.startTime = new Date().getTime();
		},
		function(error){
			alert("Failed");
		}
	);

	$scope.optionSelected = function(selectedOption){
		$scope.selectedQuestion.userResponse = selectedOption;
	}

	$scope.prevQuestion = function(){
		if($scope.selectedQuestion.userResponse != null && $scope.selectedQuestion.userResponse != ""){
			var tmpText = $scope.selectedQuestion.userResponse.match(/\d+$/)[0];
			$scope.selectedQuestion.userFormattedResponse = parseInt(tmpText);
		}
		else{
			$scope.selectedQuestion.userFormattedResponse = -1;
		}
		if($scope.nextDisabled)
			$scope.nextDisabled = false;
		$scope.currentQuestionNumber -= 1;
		$scope.selectedQuestion = $scope.questionData[$scope.currentQuestionNumber - 1];
		if($scope.currentQuestionNumber-1 < 1){
			$scope.prevDisabled = true;
			$scope.nextDisabled = false;
		}
	}

	$scope.nextQuestion = function(){
		if($scope.selectedQuestion.userResponse != null && $scope.selectedQuestion.userResponse != ""){
			var tmpText = $scope.selectedQuestion.userResponse.match(/\d+$/)[0];
			$scope.selectedQuestion.userFormattedResponse = parseInt(tmpText);
		}
		else{
			$scope.selectedQuestion.userFormattedResponse = -1;
		}

		if($scope.prevDisabled)
			$scope.prevDisabled = false;

		$scope.currentQuestionNumber += 1;
		$scope.selectedQuestion = $scope.questionData[$scope.currentQuestionNumber - 1];
		if($scope.currentQuestionNumber+1 > $scope.questionData.length){
			$scope.prevDisabled = false;
			$scope.nextDisabled = true;
		}
	}

	$scope.submitQuiz = function(){
		$scope.endTime = new Date().getTime();
		$scope.totalTimeTaken = $scope.endTime - $scope.startTime;
		if($scope.selectedQuestion.userResponse != null && $scope.selectedQuestion.userResponse != ""){
			var tmpText = $scope.selectedQuestion.userResponse.match(/\d+$/)[0];
			$scope.selectedQuestion.userFormattedResponse = parseInt(tmpText);
		}
		else{
			$scope.selectedQuestion.userFormattedResponse = -1;
		}
		$scope.showQuizresult = true;
		$scope.resultStatistics = {
			questionAttempted: 0,
			questionNotAttempted: 0,
			correctAnswer: 0,
			wrongAnswer: 0,
			totalTimeTaken: timeFormtting($scope.totalTimeTaken/1000)
		};
		angular.forEach($scope.questionData, function(result){
			if(result.userFormattedResponse != -1){
				$scope.resultStatistics.questionAttempted += 1;
				if(result.answer == (result.userFormattedResponse - 1))
					$scope.resultStatistics.correctAnswer += 1;
				else
					$scope.resultStatistics.wrongAnswer += 1;
			}
			else{
				$scope.resultStatistics.questionNotAttempted += 1;
			}
		});
	}
}])

.factory("SessionService", ['$window', function($window) {
	return {
		set:function(key, val) {
				$window.localStorage.setItem(key, JSON.stringify(val));
			},
		get: function(key) {
				var str = $window.localStorage.getItem(key);
				var result = undefined;
				try {
					result = str ? JSON.parse(str) : result;
				}
				catch (e) {
					console.log('Parse error for localStorage ' + key);
				}
				return result;
			},
		unset: function(key) {
				$window.localStorage.removeItem(key);
			},
	}
}])

.service('apiCallService', function($http,$q){
	var baseUrl = "https://cdn.rawgit.com/santosh-suresh/39e58e451d724574f3cb/raw/784d83b460d6c0150e338c34713f3a1c2371e20a/";
	var fetchDataFromAPI = function(urlEndpoint){
		return $http({
			method : 'GET',
			url : baseUrl + urlEndpoint
		}).then(function successCallback(response) {
			return response;
		}, function errorCallback(error) {
			return $q.reject(error)
		})
	};
	
	var postDataToAPI = function(urlEndpoint,param){
		return $http({
			method : 'POST',
			url : baseUrl + urlEndpoint,
			data : param
		}).then(function successCallback(response) {
			return response;
		}, function errorCallback(error) {
			return $q.reject(error);
		});
	}
	
	return {
		fetchDataFromAPI : fetchDataFromAPI,
		postDataToAPI : postDataToAPI
	}
})
