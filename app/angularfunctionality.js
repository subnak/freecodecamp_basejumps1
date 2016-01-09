var app = angular.module("mainModule",[]);

app.controller("SignupController",["$http", function($http){
    var topLevelScope=this;
    this.name="";
    this.email="";
    this.password="";
    this.usernameAlreadyExists=false;
    this.emailAlreadyExists=false;
    this.testvariable=0;
    
    this.signup = function signup(){
        this.usernameAlreadyExists=false;
        this.emailAlreadyExists=false;
        var postingObject={
            name: this.name,
            email: this.email,
            password: this.password
        };
        console.log("trying to post");
        $http.post("/signup",postingObject).then(function successCallback(response){
          alert("response from the server: "+JSON.stringify(response.data));
          if(response.data.name==="alreadyExists"){
              topLevelScope.usernameAlreadyExists=true;
          }
          if(response.data.email==="alreadyExists"){
              topLevelScope.emailAlreadyExists=true;
          }
        },function errorCallback(response){
          alert(JSON.stringify(response));
        });
    };

    
}]);

app.controller("LoginController",['$http',function($http){
    var topLevelScope=this;
    this.email="";
    this.password="";
    this.testvariable=12;
    
    this.login= function login(){
        alert("attempting login");
        var loginObject={
            email:this.email,
            password:this.password
        };
        $http.post('/login',loginObject).then(function successCallback(response){
            alert("success");
        },function errorCallback(response){
            console.log(JSON.stringify(response));
        });
    };

    
    
}]);