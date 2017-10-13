messages = {};

var messagesList = [];
var messagesId = 1;

messages.getMessages = function(counter) {
    var newMessages = [];
        for (var i = counter; i < messagesList.length; i++) 
            newMessages.push(messagesList[i]);
    return newMessages;
}

messages.addMessage = function(message){
    //message.timestamp = messages.convertLongToTime(message.timestamp);
    message.id = messagesId++;
    messagesList.push(message);
    return messagesId-1;
}

messages.deleteMessage = function(id){
    for(var i = 0; i < messagesList.length; i++){
        if(messagesList[i].id == id){
            messagesList.splice(i,1);
        }
    }
}

messages.getMessagesListLength = function(){ 
    return messagesList.length
}

messages.convertLongToTime = function(date){
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

module.exports = messages;