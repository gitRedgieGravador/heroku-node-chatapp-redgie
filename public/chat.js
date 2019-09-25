$(function() {

    $("#avaDiv").hide();
    $("#btnStart").attr("disabled", true);
    var socket = io();
    var avatari = "";
    var usernamei = "";
    $("#main").hide();
    $("#btnStart").click(function() {
        usernamei = $("#username").val();
        $("#LoginDiv").hide();
        $("#main").show();
        socket.emit('online', { username: usernamei, source: avatari });
        $("#own").attr("src", avatari)
        $("#ownlabel").text(" " + usernamei)
        socket.emit('broadcast', usernamei)
    });

    $("#btnAvatar").click(function() {
        $("#avaDiv").show();
    });

    $(".avatar").click(function() {
        avatari = $(this).attr("src");
        $("#preview").attr("src", avatari);
        $("#prevtx").text("Your Avatar")
        $("#avaDiv").hide();
        $("#btnStart").attr("disabled", false);
    });

    $(".input").keydown(function() {
        socket.emit("typing", { username: usernamei, avatar: avatari })
    })

    $(".input").keyup(function() {
        if ($(this).val() == "") {
            socket.emit('stop-typing', { username: usernamei, avatar: avatari })
        }
    })

    $("#logout").click(function() {
        socket.emit('logout', usernamei)
        location.reload();
    })

    $('form').submit(function(event) {
        event.preventDefault()
        socket.emit('chat message', { username: usernamei, msg: $('#m').val() });
        socket.emit('stop-typing', { username: usernamei, avatar: avatari })
        var nickname = usernamei;
        if (usernamei.length > 4) {
            nickname = usernamei.slice(0, 4);
        }

        $('#messages').append(
            $("<img>", { src: avatari, class: "chatAvatarR" }),
            $("<p>", { class: "Rlabel" }).text(nickname),
            $('<p>', { class: "rightSmg" }).text($('#m').val()));
        $("#chatbox").scrollTop($("#chatbox")[0].scrollHeight);
        $('#m').val('');
        return false;
    });

    socket.on('chat message', function(data) {
        let sender = data.username;
        let sms = data.msg;
        var nickname = sender;
        if (sender.length > 6) {
            nickname = sender.slice(0, 6);
        }
        if (sender != usernamei) {
            $('#messages').append(
                $("<img>", { src: data.source, class: "chatAvatarL" }),
                $("<p>", { class: "Llabel" }).text(nickname),
                $('<p>', { class: "leftSmg" }).text(sms));
            $("#chatbox").scrollTop($("#chatbox")[0].scrollHeight);
        }
    });

    var current = [];
    socket.on('online', function(msg) {
        $("#onlineUser").text("Active: " + msg.length)
        for (let i = 0; i < msg.length; ++i) {
            if (!current.includes(msg[i].username) && msg[i].username != usernamei) {
                $("#users").append($("<img>", { src: msg[i].source, class: "avatar-online", alt: msg[i].username }),
                    $("<span>").text("  " + msg[i].username), $("<br>"));
                current.push(msg[i].username);
            }
        }
    });

    var aft_disconnect = [];
    socket.on('logout', function(data) {
        $("#users").empty()
        $("#onlineUser").text("Active: " + data.length)
        for (let i = 0; i < data.length; ++i) {
            if (!aft_disconnect.includes(data[i].username) && data[i].username != usernamei) {
                $("#users").append($("<img>", { src: data[i].source, class: "avatar-online", alt: data[i].username }),
                    $("<span>").text("  " + data[i].username), $("<br>"));
                aft_disconnect.push(data[i].username);
            }
        }

    })

    var now_typing = []
    socket.on("typing", function(data) {
        if (data.username != usernamei && !now_typing.includes(data.username)) {
            now_typing.push(data.username);
            $("#divTyping").append($("<img>", { src: data.avatar, class: "typing" }), $("<span>").text("..."))
        }
    });

    socket.on("stop-typing", function(data) {
        $('#divTyping').empty();
        for (var i = 0; i < now_typing.length; i++) {
            if (now_typing[i] === data.username) {
                now_typing.splice(i, 1);
            }
        }
        for (var i = 0; i < now_typing.length; i++) {
            $("#divTyping").append($("<img>", { src: data.avatar, class: "typing" }), $("<span>").text("..."))
        }
        if (now_typing.length == 0) {
            $("#divTyping").text("");
        }
    });

    socket.on('broadcast', function(data) {
        if (data != $("#username").val()) {
            $(document).append($("<p>", { class: 'top_right' }).text(data + " has left"))
        }
    })

});