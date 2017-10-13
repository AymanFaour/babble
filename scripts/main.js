    window.Babble = {
    
        messageCounter: 0,
        messagesList: [],
        onClickFlag: 0,
    
        /**
         * @param {Object} userInfo
         */
        register: function(userInfo){
            setBabbleLocalStorage("", userInfo.name, userInfo.email);
        },
        
        /**
         * @param {Number} counter 
         * @param {Function} callback 
         */
    
        getMessages: function(counter, callback){
            request({method:"GET", action:"http://localhost:9000/messages?counter=" + counter, data: null, 
            callbackFunction: function(e){
                if(callback != null)
                    callback(e);
            },
            recallFunction: null});
        },
        /**
         * @param {Object} message
         * @param {Function} callback
         */
        postMessage: function(message, callback) {
            request({method:'POST', action:'http://localhost:9000/messages', data: JSON.stringify(message),
            callbackFunction: function(e){
                if(callback!=null)
                    callback(e);
            },
            recallFunction: null});
        },
        /**
         * @param {Function} callback
         */
        getStats: function(callback){
            request({method:'GET', action:'http://localhost:9000/stats', data: null,
            callbackFunction: function(e) {
                if(callback!=null)
                    callback(e);
            },
            recallFunction: null});
        },
        /**
         * @param {integer} id
         * @param {Function} callback
         */
        deleteMessage: function(id, callback){
            request({method:'DELETE', action:'http://localhost:9000/messages/' + id, data: null,
            callbackFunction: function(e) {
                callback(e);
            },
            recallFunction: null});
        }
    
    }
    
    window.addEventListener('load', onLoad);
    window.addEventListener('beforeunload',decrementUsersCounterInServer);
    window.addEventListener('resize', onResize);

    function onLoad(){
        Babble.getStats(getStatsCallbackFunction);
        checkLogIn();
        firstLoadGetStats(firstLoadGetStatsCallbackFunction);
        setTimeout(function(){
            sendMessage();
            Babble.deleteMessage(-1, deleteMessageCallbackFunction);
            Babble.getMessages(Babble.messageCounter, getMessagesCallbackFunction);
            makeGrowable(document.getElementsByClassName("inputMessageDiv")[0]);
            setTextAreaValue();
        }, 10);
    }

    function onResize(){
        if(document.documentElement.clientWidth < 637){
            setMobileHeights();
        }
        else {
            setDesktopHeights();
            setTextAreaHeight(document.getElementsByClassName("inputMessageDiv")[0]);
        }
    }
    
    function incrementUsersCounterInServer(callback){
        request({method:'GET', action:'http://localhost:9000/incrementuserscounter', data: "",
        callbackFunction: null,
        recallFunction: null});
    }
    
    function decrementUsersCounterInServer(callback){
        request({method:'GET', action:'http://localhost:9000/decrementuserscounter', data: "",
        callbackFunction: null,
        recallFunction: null});
    }
    
    function setMessageWidth(el){
        for(var i = 0; i < el.length ; i ++){
            var theMessage = el[i].getElementsByClassName("message")[0];
            var theLi = el[i];
            if(theLi.clientWidth < theMessage.clientWidth) 
                theMessage.style.width = theLi.clientWidth + 'px'
            else 
                theMessage.style.width = "auto";
        }
    }
    
    function makeGrowable(container) {
            var area = container.getElementsByTagName('textarea')[0];
            var clone = container.getElementsByTagName('span')[0];
            var height = (15 * document.documentElement.clientHeight)/100;
            area.addEventListener('input', function(e) {
                if(document.documentElement.clientWidth >= 638){
                clone.textContent = area.value;
                setTimeout(function(){
                    var pre = container.getElementsByTagName('pre')[0];
                    var buttonImg = document.getElementsByClassName('buttonDiv')[0].getElementsByTagName('img')[0];
                    if(pre.clientHeight < height){
                        document.getElementsByTagName('ol')[0].style.height = (62 * document.documentElement.clientHeight)/100 + 'px';
                        document.getElementsByClassName('inputDiv')[0].style.height = height + 'px';
                        document.getElementsByClassName('buttonDiv')[0].style.height = height + 'px';
                        var marginButton = (3.5 * document.documentElement.clientHeight)/100;
                        buttonImg.style.marginTop = marginButton + 'px';
                    }
                    else{
                        document.getElementsByClassName('inputDiv')[0].style.height = pre.clientHeight + 'px';
                        document.getElementsByClassName('buttonDiv')[0].style.height = pre.clientHeight + 'px';
                        var theHeight = pre.clientHeight;
                        if(pre.clientHeight > 300) theHeight = 300;
                        var marginButton = (theHeight - buttonImg.clientHeight)/2;
                        buttonImg.style.marginTop = marginButton + 'px';
                        var olHeight = document.documentElement.clientHeight - (23 * document.documentElement.clientHeight)/100 - theHeight;
                        document.getElementsByTagName('ol')[0].style.height = olHeight + 'px';
                    }
                },10);
            }
            var babble = JSON.parse(localStorage.getItem("babble"));
            setBabbleLocalStorage(area.value, babble.userInfo.name, babble.userInfo.email);
            });
    }
    
    /* 
    first we add the variable babble in the local storage
    then check the local storage (babble variable)
    if it was null at the beggining then show the modal,
    and according to the user select (anonymous / non anonymous) the local
    storage will be filled or stay as it is when we call Babble.register
    if babble variable is not empty then modal will be hidden always
    */
    function checkLogIn(){
        var babble = localStorage.getItem("babble");
        if(babble == null){
            Babble.register({name: "", email: ""});
            document.getElementsByClassName("modal")[0].classList.remove("hidden");
            document.getElementsByClassName("saveButton")[0].addEventListener('click', function(){
                var name = document.getElementsByClassName("inputUsername")[0].value;
                var email = document.getElementsByClassName("inputEmailAddress")[0].value;
                if(name == "" || email ==""){
                    document.getElementsByClassName("requiredField")[0].classList.remove("hidden");
                }
                else{
                    Babble.register({name: name, email: email});
                    document.getElementsByClassName("modal")[0].classList.add("hidden");
                    incrementUsersCounterInServer();
                }
            });
            document.getElementsByClassName("anonymousButton")[0].addEventListener('click', function(){
                document.getElementsByClassName("modal")[0].classList.add("hidden");
                incrementUsersCounterInServer();
            }); 
        }
        else{
            document.getElementsByClassName("modal")[0].classList.add("hidden");
            incrementUsersCounterInServer();
        }
    }
    
    /*
    this method is responsible for setting the local storage 
    */
    function setBabbleLocalStorage(currentMessage, name, email){
        
        localStorage.setItem("babble",JSON.stringify ({
            currentMessage:currentMessage,
            userInfo: {
                name: name,
                email: email
            }
        }));
    }
    
    function messageMouseOver(el){
        el.style.backgroundColor = "#ebedec";
        var babble = JSON.parse(localStorage.getItem("babble"));
        var elEmail = el.getElementsByClassName("email")[0].innerText;
        var elCloseButton = el.getElementsByTagName("button")[0];
        if(typeof elCloseButton !== 'undefined' && babble.userInfo.email === elEmail){
            if(babble.userInfo.email !== ""){
            elCloseButton.classList.remove("hidden");
            elCloseButton.addEventListener('click', function(){
                if(Babble.onClickFlag == 0){
                var id = el.parentNode.id;
                id = id.substr(8, id.length);
                Babble.deleteMessage(id, deleteMessageCallbackFunction);  
                }
                Babble.onClickFlag++;
                
            })}
        }
        else if(typeof elCloseButton !== 'undefined' && babble.userInfo.email !== elEmail) el.removeChild(elCloseButton);
        
    }
    
    function messageMouseOut(el){
        el.style.backgroundColor = "#ffffff";
        if(typeof el.getElementsByTagName("button")[0] !== 'undefined')
            el.getElementsByTagName("button")[0].classList.add("hidden");
    }
    
    /*
    this method creates one new li element and appends it to the ol element.
    */
    function messageBuildAndAppend(messageInfo){
        var liById = document.getElementById(messageInfo.id);
        if(!liById){
        var li = document.createElement("li");
        li.setAttribute("id", "message#" + messageInfo.id);
        var messageImg = document.createElement("img");
        if(messageInfo.imgUrl == "")
            messageInfo.imgUrl = "images/anonymous.png";
        messageImg.setAttribute("src", messageInfo.imgUrl);
        messageImg.setAttribute("alt", '');
        var messageDiv = document.createElement("div");
        messageDiv.setAttribute("class", "message");
        messageDiv.setAttribute("tabIndex", "0");
        messageDiv.setAttribute("onmouseover", "messageMouseOver(this)");
        messageDiv.setAttribute("onmouseout", "messageMouseOut(this)");
        messageDiv.setAttribute("onfocusin", "messageMouseOver(this)");
        messageDiv.setAttribute("onfocusout", "messageMouseOut(this)");
        var messageCite = document.createElement("cite");
        messageCite.appendChild(document.createTextNode(messageInfo.name));
        var messageTime = document.createElement("time");
        var time = convertLongToTime(messageInfo.timestamp);
        var date = convertLongToDate(messageInfo.timestamp);
        messageTime.appendChild(document.createTextNode(time));
        messageTime.setAttribute("datetime", date + "T" + time);
        var messageEmailSpan = document.createElement("span");
        messageEmailSpan.appendChild(document.createTextNode(messageInfo.email));
        messageEmailSpan.setAttribute("class", "email hidden");
        var messageButton = document.createElement("button");
        var imgButton = document.createElement("img");
        imgButton.setAttribute("src", "images/closeButton.png");
        messageButton.appendChild(imgButton);
        messageButton.setAttribute("tabIndex", "0");
        messageButton.setAttribute("class", "hidden");
        messageButton.setAttribute("ariaLabel", "deleteMessage");
        var messageEmptyDiv = document.createElement("div");
        var messageContentSpan = document.createElement("span");
        messageContentSpan.appendChild(document.createTextNode(messageInfo.message));
    
        li.appendChild(messageImg);
        messageDiv.appendChild(messageCite);
        messageDiv.appendChild(messageTime);
        messageDiv.appendChild(messageEmailSpan);
        messageDiv.appendChild(messageButton);
        messageDiv.appendChild(messageEmptyDiv);
        messageDiv.appendChild(messageContentSpan);
        li.appendChild(messageDiv);
    
        document.getElementsByTagName("ol")[0].appendChild(li);
        }
    }
    
    /*
    request method as explained in class
    */
    function request(options) {
        var xhr = new XMLHttpRequest();
        xhr.open(options.method, options.action);
        if (options.method === 'POST') {
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        }
        xhr.addEventListener('load', function(event) {
            if(xhr.status == 200){
                if(options.callbackFunction != null){
                    options.callbackFunction(JSON.parse(event.target.responseText));
                }
            }
            else{
    
            }
        });
        xhr.addEventListener('error', function () {
            if (options.recallFunction != null) {
                options.recallFunction();
            }
        });
        xhr.send(options.data);
    }
    
    function sendMessage(){
        var sendButton = document.getElementsByClassName("buttonDiv")[0].getElementsByTagName("button")[0];
        var textArea = document.getElementsByClassName("inputMessageDiv")[0].getElementsByTagName("textarea")[0];
    
        sendButton.addEventListener('click', function(){
            if(textArea.value !== ""){
            var message = postMessageBuilder(textArea.value);
            
            Babble.postMessage(message, null); 
            setTimeout(function(){
                textArea.value = "";
                if(document.documentElement.clientWidth >= 638){
                    setDesktopHeights();
                }
                else 
                    setMobileHeights();
                },20);
                
                var babble = JSON.parse(localStorage.getItem("babble"));
                if(babble != null)
                setBabbleLocalStorage("", babble.userInfo.name, babble.userInfo.email);
            }
        });
        
        textArea.addEventListener('keypress', function(e){
            var key = e.which || e.keyCode;
            if (key === 13) {
                e.preventDefault();
                if(textArea.value !== ""){
                var message = postMessageBuilder(textArea.value);
                Babble.postMessage(message, null); 
                setTimeout(function(){
                textArea.value = "";
                if(document.documentElement.clientWidth >= 638){
                    setDesktopHeights();
                }
                else 
                    setMobileHeights();
                
                var babble = JSON.parse(localStorage.getItem("babble"));
                if(babble != null)
                setBabbleLocalStorage("", babble.userInfo.name, babble.userInfo.email);
                },20);
            }
        }  
        });
    
    }
    
    function setDesktopHeights(){
        document.getElementsByTagName('ol')[0].style.height = (62 * document.documentElement.clientHeight)/100 + 'px';
        var buttonImg = document.getElementsByClassName('buttonDiv')[0].getElementsByTagName('img')[0];
        var height = (15 * document.documentElement.clientHeight)/100;
        document.getElementsByClassName('inputDiv')[0].style.height = height + 'px';
        document.getElementsByClassName('buttonDiv')[0].style.height = height + 'px';
        var marginButton = (3.5 * document.documentElement.clientHeight)/100;
        buttonImg.style.marginTop = marginButton + 'px';
    }
    
    function setTextAreaHeight(container){
        var area = container.getElementsByTagName('textarea')[0];
        var clone = container.getElementsByTagName('span')[0];
        var height = (15 * document.documentElement.clientHeight)/100;
            if(document.documentElement.clientWidth >= 638){
            clone.textContent = area.value;
            setTimeout(function(){
                var pre = container.getElementsByTagName('pre')[0];
                var buttonImg = document.getElementsByClassName('buttonDiv')[0].getElementsByTagName('img')[0];
                if(pre.clientHeight < height){
                    document.getElementsByTagName('ol')[0].style.height = (62 * document.documentElement.clientHeight)/100 + 'px';
                    document.getElementsByClassName('inputDiv')[0].style.height = height + 'px';
                    document.getElementsByClassName('buttonDiv')[0].style.height = height + 'px';
                    var marginButton = (3.5 * document.documentElement.clientHeight)/100;
                    buttonImg.style.marginTop = marginButton + 'px';
                }
                else{
                    document.getElementsByClassName('inputDiv')[0].style.height = pre.clientHeight + 'px';
                    document.getElementsByClassName('buttonDiv')[0].style.height = pre.clientHeight + 'px';
                    var theHeight = pre.clientHeight;
                    if(pre.clientHeight > 300) theHeight = 300;
                    var marginButton = (theHeight - buttonImg.clientHeight)/2;
                    buttonImg.style.marginTop = marginButton + 'px';
                    var olHeight = document.documentElement.clientHeight - (23 * document.documentElement.clientHeight)/100 - theHeight;
                    document.getElementsByTagName('ol')[0].style.height = olHeight + 'px';
                }
            },10);
        }
    }
    
    function setMobileHeights(){
        document.getElementsByTagName('ol')[0].style.height = (58 * document.documentElement.clientHeight)/100 + 'px';
        var buttonImg = document.getElementsByClassName('buttonDiv')[0].getElementsByTagName('img')[0];
        var height = (12 * document.documentElement.clientHeight)/100;
        document.getElementsByClassName('inputDiv')[0].style.height = height + 'px';
        document.getElementsByClassName('inputDiv')[0].style.marginButton = (2 * document.documentElement.clientHeight)/100 + 'px';
        document.getElementsByClassName('buttonDiv')[0].style.height = (14 * document.documentElement.clientHeight)/100 + 'px';
        var marginButton = (1.5 * document.documentElement.clientHeight)/100;
        buttonImg.style.marginTop = marginButton + 'px';
    }
    
    function setTextAreaValue(){
        var area = document.getElementsByClassName("inputMessageDiv")[0].getElementsByTagName('textarea')[0];
        var babble = JSON.parse(localStorage.getItem("babble"));
        if (babble!=null && babble.currentMessage != ""){
            area.value = babble.currentMessage;
            setTimeout(function(){
                setTextAreaHeight(document.getElementsByClassName("inputMessageDiv")[0]);
            },10) 
        }
    
    }
    
    function postMessageBuilder(messageContent){
        var message;
        var babble = JSON.parse(localStorage.getItem("babble"));
        var name = babble.userInfo.name;
        if(name == "")
            name = "Anonymous";
    
        message = {
            name: name,
            email: babble.userInfo.email,
            message: messageContent,
            timestamp: Date.now()
        }
    
        return message;
    }
    
    function getMessagesCallbackFunction(e){
        Babble.messageCounter = Babble.messageCounter + e.addedMessages;
        for(var i = 0; i < e.updatedMessages.length; i ++){
            messageBuildAndAppend(e.updatedMessages[i]);
        }
        setTimeout(function(){
            var ol = document.getElementsByTagName("ol")[0];
            ol.scrollTop = ol.scrollHeight;
            Babble.getMessages(Babble.messageCounter, getMessagesCallbackFunction);
        },10);
    }
    
    function postMessagesCallbackFunction(e){
    }
    
    function getStatsCallbackFunction(e){
        document.getElementsByTagName("dl")[0].getElementsByTagName("dd")[0].innerHTML = "" + e.allMessagesLength;
        document.getElementsByTagName("dl")[0].getElementsByTagName("dd")[1].innerHTML = "" + e.usersCounter;
        setTimeout(function(){
            Babble.getStats(getStatsCallbackFunction);
        },20);
    }
    
    function deleteMessageCallbackFunction(e){
        var li = document.getElementById("message#" + e.id);
        if(li){
            li.parentNode.removeChild(li);
            Babble.messageCounter = Babble.messageCounter-1;
            setTimeout(function(){
                Babble.deleteMessage(-1, deleteMessageCallbackFunction);
            },200)
            
        }
        setTimeout(function(){
            Babble.onClickFlag = 0;
        },300);
    }
    
    function convertLongToTime(date){
        var date = new Date(date);
        var time = "";
        if(date.getHours().toString().length < 2){
            time = "0" + date.getHours();
        }
        else time += date.getHours();
        if(date.getMinutes().toString().length < 2){
            time += ":0" + date.getMinutes();
        }
        else time +=  ":" + date.getMinutes();
        return time;
    }

    function convertLongToDate(date){
        var date = new Date(date);
        var theDate = "";
        theDate += date.getFullYear();
        if((date.getMonth()+1).toString().length < 2){
            theDate += "-0" + (date.getMonth() + 1);
        }
        else theDate +=  "-" + (date.getMonth() + 1);
        
        if(date.getDate().toString().length < 2){
            theDate += "-0" + date.getDate();
        }
        else theDate +=  "-" + date.getDate();
        return theDate;
    }

    function firstLoadGetStats(callback){
        request({method:'GET', action:'http://localhost:9000/firstLoadGetStats', data: null,
        callbackFunction: function(e){
            if(callback!=null)
                callback(e);
        },
        recallFunction: null});
    }

    function firstLoadGetStatsCallbackFunction(e){
        console.log(e);
        document.getElementsByTagName("dl")[0].getElementsByTagName("dd")[0].innerHTML = "" + e.allMessagesLength;
        document.getElementsByTagName("dl")[0].getElementsByTagName("dd")[1].innerHTML = "" + e.usersCounter;
    }