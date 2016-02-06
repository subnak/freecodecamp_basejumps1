var app = angular.module("mainModule",[]);
app.value("loggedIn",false);

app.controller("SignupController",["$http","loggedIn", function($http,loggedIn){
    var topLevelScope=this;
    this.name="";
    this.email="";
    this.password="";
    this.usernameAlreadyExists=false;
    this.emailAlreadyExists=false;
    this.testvariable=0;
    this.loggedIn=loggedIn;
    
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
            
        },function errorCallback(response){
          alert(JSON.stringify(response));
        });
    };

    
}]);

app.controller("LoginController",['$http','loggedIn',function($http,loggedIn){
    var topLevelScope=this;
    this.email="";
    this.password="";
    this.testvariable=12;
    this.loggedIn=loggedIn;
    
    this.login= function login(){
        var loginObject={
            email:this.email,
            password:this.password
        };
        
        $http.post('/login',loginObject).then(function successCallback(response){
            if(response.data==="valid"){
                alert("valid login");
                loggedIn=true;
                alert(loggedIn);
                this.loggedIn=true;
            }else{
                alert("invalid login attempt");
            }
        },function errorCallback(response){
            console.log(JSON.stringify(response));
        });
    };
    
    
}]);

app.controller('ProfileController',['$http', '$log','$scope',function($http,$log,$scope){
  google.load('visualization', '1.0', {'packages':['corechart']});
    var topLevelScope=this;
    this.numOptions=[1,1];
    this.options=[];
    this.pollTitle="";
    this.lookingAtMyPolls=false;
    this.polls=[];
    this.testvariable=14;
    $scope.$log = $log;
    $scope.message = 'Hello World!';
    
    this.moreOptions=function moreOptions(){
        this.numOptions.push(1);
    };
    
    this.toggleLookingAtMyPolls = function toggleLookingAtMyPolls(){
        this.lookingAtMyPolls=!this.lookingAtMyPolls;
    }
    
    this.enumerateOptions = function enumerateOptions(){
    };
    
    this.saveOptions = function saveOptions(){
        var listOfOptionObjects = {};
        for(var i=0;i<this.options.length;i++){
            var temp=this.options[i];
            listOfOptionObjects[temp]=0;
        };
        var poll={name:"",options:""};
        poll['name']=this.pollTitle;
        poll['options']=listOfOptionObjects;
        $log.log("trying to save the poll: "+JSON.stringify(poll));
        $http.post('/profile',poll).then(function successCallback(response){
                $log.log("success!!!!");
                topLevelScope.polls.push(poll);
            
        }),(function errorCallback(response){
            
        });
    };
    
    
    this.printPolls = function printPolls(){
        console.log("polls accessed by the controller: "+this.polls);
        console.log("first option: "+this.polls[0].name)
        console.log("number of Polls: "+this.polls.length);

    };
    
    this.initializePolls= function initializePolls(obj){
        this.polls=JSON.parse(obj);
    }
    
    this.drawChart = function drawChart(pollObject) {
	
	        // Create the data table.
	        var data = new google.visualization.DataTable();
	        data.addColumn('string','option');
	        data.addColumn('number','votes');
	        for(var i=0;i<Object.keys(pollObject.options).length;i++){
	            console.log(Object.keys(pollObject.options)[i]);
	            var objectKey=Object.keys(pollObject.options)[i];
	            console.log(pollObject.options[objectKey])
	            data.addRow([objectKey,pollObject.options[objectKey]]);
	        }
	
	        // Set chart options
	        var options = {'title':pollObject.name,
	                       'width':500,
	                       'height':400};
	
	        // Instantiate and draw our chart, passing in some options.
	        var chart = new google.visualization.PieChart(document.getElementById('chart_div'));
	        chart.draw(data, options);
	      }
	      
	this.deletePoll = function deletePoll(poll){
	    $log.log("trying to delete poll");
	    poll["user"]=
	    $http.put("/profile",poll).then(function successCallback(response){
	        $log.log("response from server: "+JSON.stringify(response));
	        $log.log("list of polls: "+JSON.stringify(topLevelScope.polls));
	        topLevelScope.polls=response.data.polls;
	        $log.log("list of polls after: "+JSON.stringify(topLevelScope.polls));
	    }),(function errorCallback(response){
	        
	    });
	};
}]);



app.controller('SplashController',['$http', '$log', '$scope', function($http,$log,$scope){
    var topLevelScope=this;
    this.polls=[];
    this.testvariable=12;
    this.activeOptions=[];
    this.activeId="";
    google.load('visualization', '1.0', {'packages':['corechart']});
    
    this.initializePolls= function initializePolls(obj){
        this.polls=JSON.parse(obj);
    }
    
    this.deleteAllRecords = function deleteAllRecords(){
        $log.log("angular trying to delete");
        $http.put('/',{}).then(function successCallback(response){
            $log.log(response.data);
        }),(function errorCallback(response){
            
        });
        
    }
    
    this.incrementVotes = function incrementVotes(option){
        var incrementObject={pollId:this.activeId,toBeIncremented:option};
        $http.post('/',incrementObject).then(function successCallback(response){
            if(response.data==="alreadyVoted"){
                alert("hey! you already voted on this poll!");
            }else{
                //updates the local model before redrawing;
                for(var i=0;i<topLevelScope.polls.length;i++){
                    if(topLevelScope.polls[i]._id===response.data._id){
                        topLevelScope.polls[i]=response.data;
                    }
                }
                topLevelScope.drawChart(response.data);
            }
        }), (function errorCallback(response){
                        
        });
    };
    
    this.drawChart = function drawChart(pollObject) {
        	// Create the data table.
	        var data = new google.visualization.DataTable();
	        data.addColumn('string','option');
	        data.addColumn('number','votes');
        
        if(this.activeId!=pollObject._id){
            this.activeId=pollObject._id;
            topLevelScope.activeOptions=[];
	        
	        for(var i=0;i<Object.keys(pollObject.poll.options).length;i++){
	           // console.log(Object.keys(pollObject.poll.options)[i]);
	            var objectKey=Object.keys(pollObject.poll.options)[i];
	            data.addRow([objectKey,pollObject.poll.options[objectKey]]);
	            topLevelScope.activeOptions.push(objectKey);
	        }
        }else{
            for(var i=0;i<topLevelScope.activeOptions.length;i++){
                var objectKey=topLevelScope.activeOptions[i];
                data.addRow([objectKey,pollObject.poll.options[objectKey]]);
            }
        }
	        
	
	        // Set chart options
	        var options = {'title':pollObject.poll.name,
	                       'width':500,
	                       'height':400,
	                       'pieHole':0.4
	        };

	        // Instantiate and draw our chart, passing in some options.
	        var chart = new google.visualization.PieChart(document.getElementById('chart_div'));
	        chart.draw(data, options);
	      }
    
}]);


	      // Load the Visualization API and the piechart package.
	      google.load('visualization', '1.0', {'packages':['corechart']});
	
	      // Set a callback to run when the Google Visualization API is loaded.
	      //google.setOnLoadCallback(drawChart);
	
	      // Callback that creates and populates a data table,
	      // instantiates the pie chart, passes in the data and
	      // draws it.
	      
	      

