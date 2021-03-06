function get_id() {
    var client = new HttpClient();
    var response = client.get('http://'+host_server_ip+':3000/new_user', function(response) {
        crdt_set_user_id(response);
    });
}

function get_change_log(user_id){
    var response = client.get('http://'+host_server_ip+':3000/get_change_log?user_id', function(response) {
        content = JSON.parse(response);
        render_text();
    });
}

function render_text() {
    text = ""
    for (index = 0; index < content['content'].length; index++) { 
        if ( !content['content'][index]['start'] && !content['content'][index]['tombstone'] ){
            text += content['content'][index]['element'];
        } 
        if(index+1 == crdt_get_cursor_pos()){
            text += '|'
        }
    }
    document.getElementById("textarea").innerHTML = text;
    return text;
}

function process_key_press(event) {
    var key = event.keyCode
    if(String.fromCharCode(key)>='A' && String.fromCharCode(key)<='Z'){
        crdt_local_append_in_crdt(key+32);
    }
    else if(key==8){
        crdt_backspace_key();
    }
    else if(key==37){
        crdt_left_key();
    }
    else if(key==39){
        crdt_right_key();
    }
    else if(key==32){
        crdt_local_append_in_crdt(key);
    } 
    else if(key==188){
        crdt_local_append_in_crdt(44);
    }
    else if(key==190){
        crdt_local_append_in_crdt(46);
    }
    else if(key==186){
        crdt_local_append_in_crdt(59);
    }
    else if(key==222){
        crdt_local_append_in_crdt(39);
    }

}

function sync_local_update_commands_with_server(){
    var client = new HttpClientPost();
    var tuple = crdt_get_local_update_commands();
    var events = {
        'commands': tuple[0]
    }
    var response = client.post('http://'+host_server_ip+':3000/send_change_log', events, function(response) {
        crdt_update_local_uupdate_pos(tuple[1]);
    });
}

function sync_remote_update_commands_with_server(){
    var client = new HttpClient();
    var response = client.get('http://'+host_server_ip+':3000/get_change_log?user_id='+crdt_get_user_id(), function(response) {
        var remote_commands = JSON.parse(response);
        for (var i=0 ; i<remote_commands['commands'].length ; i++){
            crdt_process_remote_command(remote_commands['commands'][i]);
        }
    });
}


