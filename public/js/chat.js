console.log("test test 2");
    document.getElementsByClassName("choose-icon-wrap")[0].style.display="none";
    document.getElementsByClassName("container-main")[0].style.display="none";
    document.getElementsByClassName("title")[0].style.display="none";
    document.getElementsByClassName("description")[0].style.display="none";
   
    var colorArray=["#ff4d4d","#cc66ff","#00ccff","#f0532c","#3385ff","#ffff00","#8080ff","#ff66ff","#ff8000","#00e673"];  /*each use gets a diffferent color, and if we hae more that ten user, the colors are designated periodically*/
    var userArray=[];
    var colorIndex=0;
    var myUserName="user";                                      /*the current user can be global, so we won't have to send it to every fuction*/
    var myUserIcon="http://i64.tinypic.com/30tm3d5.png";
    var myUserColor = "#6acc1a";
    const socket = io.connect('http://localhost:80');
    

    

    /*we have two types of objects that can be sent:
    /* 1) user primary information: includes the user name and icon, this type of information is sent when the user logs in
    /* 2) message: includes the user name, icon source, user color and the message   */

    var user= function(user_name, iconsrc)
    {
        this.user_name = user_name;
        this.iconsrc = iconsrc;
    }
    

     var message = function(user_name, iconsrc, message)    
     {
        this.user_name = user_name;
        this.iconsrc = iconsrc;
        this.message = message;
     };

    function isNameTaken(input_name)
    {
        for(var i in userArray)
        {
            if(userArray[i].user_name==input_name)
                return true;
        }
        return false;
    }
             
    function setUserName(){
        
        console.log("my user name: " +myUserName);
        
        var input_name= document.getElementById("user-name").value;
        
        if(isNameTaken(input_name))                             
            alert("Sorry, this user name elready exists"); 
        
        if(input_name=="")
        {
            alert("You have to choose a user name!");
        }
        
        else
        {
            myUserName=input_name;
            document.getElementsByClassName("login-wrap")[0].style.display="none";
            document.getElementsByClassName("choose-icon-wrap")[0].style.display="block";
        }   
    } 
    
    function enterChat(){
        
        document.getElementsByClassName("choose-icon-wrap")[0].style.display="none";
        document.getElementsByClassName("container-main")[0].style.display="flex";
        document.getElementsByClassName("title")[0].style.display="block";
        document.getElementsByClassName("description")[0].style.display="block";
        document.getElementsByClassName("user-list")[0].innerHTML += "<li><img class=\"message-image\" src="+myUserIcon+" alt=\"my icon\"><div class=\"name-list\"><span>"+myUserName+"</span></div></li>";
          /*send the information to other connected ussers, so the current user's icon and name will be written on their contact list*/

        var my_user = new user(myUserName, myUserIcon);
        socket.emit('new user', my_user);
        console.log(my_user);
        userArray.push(my_user);
           
    }   
    
    function setUserIcon(iconSrc)
    {
        myUserIcon = iconSrc;
        document.getElementById("displayChosenIcon").src=myUserIcon;
    }


    function displayMyMessage(text)
    {
        var additionalHTML= "<img src="+myUserIcon+" alt=\"myUser\"><div class=\"bubble\"><div class=\"txt\"><p class=\"name\">"+myUserName+"</p><p class=\"message\">"+text+"</p><span class=\"timestamp\">"+getTime()+"</span></div><div class=\"bubble-arrow\"></div></div>";
        document.getElementsByClassName("messages")[0].innerHTML += additionalHTML; 
    }
    
    function displayOtherMessage(data)
    {               
        var additionalHTML= "<img id=\"img-alt\" src="+data.iconsrc+" alt=\"user\"><div class=\"bubble alt-bubble\"><div class=\"txt\"><p class=\"name\"><font color="+getUserColor(data.user_name)+"> "+data.user_name+"</font></p><p class=\"message\">"+data.message+"</p><span class=\"timestamp\">"+getTime()+"</span></div><div class=\"bubble-arrow alt-arrow\"></div></div>";
        document.getElementsByClassName("messages")[0].innerHTML += additionalHTML;
    }
        

    function getUserColor(user){
        
        if(user==myUserName)
        {
            return myUserColor;
        }
       else
       {
           var colorIndex;
             var i;  
            for(i=0;i<userArray.length;i++)
            {
                console.log("userArray["+i+"].user_name= " +userArray[i].user_name);
                if(i==0)
                {
                    colorIndex=0;

                }
                    if(userArray[i].user_name==user)   /*there are only 10 colors, if we have more than en users, the colors are designated periodically: for example, the 11th user will get the first color,    
                    and so on.*/
                    {
                        if(i==0)
                        {
                          colorIndex=0; 
                        }
                        else
                        {
                            colorIndex=i%10;
                            console.log("index color: "+colorIndex);
                            break;
                        }
                    }
            }
            return colorArray[colorIndex];
        }
    }
        
    
    /*function getColorIndex(){
        if(colorIndex==colorArray.length)  /*If we reached the end of the array, start from the beginning*/
      /*      colorIndex=0;
        else
            colorIndex++;
    } */
    
    
    function getTime() {
    time = new Date();
    var hh = time.getHours();
    var mm = time.getMinutes();
    var value = hh + ":" + mm;
    return value;
    }
    
    function clearChat()
    {
         document.getElementsByClassName("messages")[0].innerHTML="";
    }
     
    function sendMessage()   /* send message to chat, messages from the current user are on the left of the screen */
    {                
        var myMessage=document.querySelector("textarea").value;
        var msg = new message(myUserName, myUserIcon, myMessage);
        if(myMessage)
        {  
            socket.emit('new message', msg); /*, myUserName, myUserIcon);*/  
            displayMyMessage(myMessage);
            document.querySelector("textarea").value='';
            var objDiv = document.getElementsByClassName("messages")[0];   /*scroll down automatically*/
            objDiv.scrollTop = objDiv.scrollHeight;

        }
        else           
            alert("You can not send an empty message!");
      
    }


    socket.on('new user', function(data)
    {
        if(data.user_name!==myUserName)
        {    
            userArray.push(data);
            /*add the profile icon and name to the contact list. note: contact list is rated from the first user online*/
            document.getElementsByClassName("user-list")[0].innerHTML += "<li><img class=\"message-image\" src="+data.iconsrc+" alt=\"my icon\"><div class=\"name-list\"><span><font color="+getUserColor(data.user_name)+"> "+data.user_name+"</font></span></div></li>";
        }
    });

    socket.on('user list', function(data)
    {
        userArray=[];
        document.getElementsByClassName("user-list")[0].innerHTML="";
        for(i=0;i<data.length;i++)
        {
                userArray.push(data[i]);
                document.getElementsByClassName("user-list")[0].innerHTML += "<li><img class=\"message-image\" src="+data[i].iconsrc+" alt=\"my icon\"><div class=\"name-list\"><span><font color="+getUserColor(data[i].user_name)+"> "+data[i].user_name+"</font></span></div></li>";
        }
    });
    
    socket.on('receive message', function(data)
    {
        console.log("receive message test: "+data.message);
    
       if(data.user_name!==myUserName)
        {
            displayOtherMessage(data);    
        }
    });

       