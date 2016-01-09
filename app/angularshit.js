var app = angular.module('test',[]);

app.controller('TrialController',['$http',function($http){
   this.x=12;
   this.name="";
   this.email="";
   this.gender="";
   this.tempName="";
   this.tempEmail="";
   this.tempGender="";
   
   this.setParameters = function setParmeters(){
       this.name=this.tempName;
       this.email=this.tempEmail;
       this.gender=this.tempGender;
   };
   
   this.postObject= function postObject(){
      var postingObject={
         name:this.name,
         email:this.email,
         gender:this.gender
      };
      $http.post("/signup",postingObject).then(function successCallback(response){
         alert("success");
      },function errorCallback(response){
         alert(JSON.stringify(response));
      });
   };
}]);