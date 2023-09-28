

function login(){
    let email = document.getElementById("LoginEmail").value;
    let password = document.getElementById("LoginPassword").value;

    signin_mutation(email, password).then( result => {
        if (result){
            localStorage.setItem('session_token', result);
            localStorage.setItem('email', email);
            window.location.href = 'pages/home.html';
        }
    } )
}


function resolve_signup(){
    let email = document.getElementById("SignupEmail").value;
    let username = document.getElementById("SignupUsername").value;
    let full_name = document.getElementById("SignupFullname").value;
    let password = document.getElementById("SignupPassword").value;
    let birthdate = document.getElementById("SignupBirthdate").value;


    signup_mutation(email, username, full_name, password, birthdate).then( result => {
        if (result['errors']){
            alert(result['errors'][0]['message']);
            return
        }
        alert('Registered! Please log in.')
        window.location.href = '../index.html';
    } )
}


function resolve_change_avatar(){
    // var credentials = JSON.parse(localStorage.getItem('USER_TOKEN'));    
    // if (!credentials){
    //     alert('Log to reply!');
    //     return;
    // }
    let modal = document.getElementById('ChangeAvatarModal');
    let content = document.getElementById('SelectAvatar').files[0];
    if (!content){
        alert('Image is required!');
        modal.click('Cancel');
        return;
    }
    let payload = "mutation{updateUser(input:{}){user{fullName avatar}}}";
    const form = new FormData();
    form.append('query', payload)
    form.append("avatar", content);

    update_user_mutation(form);
}


function build_change_avatar_modal(){
    var modal_html = document.getElementById('CHANGE_AVATAR');
    modal_html.innerHTML = `
    <div class="modal fade" id="ChangeAvatarModal" tabindex="-1" role="dialog" aria-labelledby="ChangeAvatarModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
            <h5 class="modal-title" id="ChangeAvatarModalLabel">Change Avatar</h5>
            <button type="button" class="close" data-bs-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
            </div>
            <div class="modal-body">
                <label class="form-label" for="SelectAvatar">Select Image</label>
                <input type="file" class="form-control" id="SelectAvatar" />
            </div>
            <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-dark" onclick="resolve_change_avatar()">Confirm</button>
            </div>
        </div>
        </div>
    </div>
    `
}


function resolve_homepage(){
    user_query().then(response => {
        let room_name = response['room']['name'];
        let room_description = response['room']['description'];
        let username = response['username'];
        let fullname = response['fullName'];
        let threads = response['room']['threads'].slice(0,6);
        let avatar = response['avatar'];

        if (!avatar){
            avatar = 'https://www.baxterip.com.au/wp-content/uploads/2019/02/anonymous.jpg';
        }
        else {
            avatar = `data:image/png;base64,${avatar}`;
        }

        localStorage.setItem('room', response['room']['id']);

        if (response['room']['backgroundPicture'] && response['room']['defaultBackgroundActive'] == false){
            document.getElementById("HomePageBody").style.backgroundImage  = `url("data:image/png;base64,${response['room']['backgroundPicture']}")`;
        }

        if (response['room']['roomPicture']){
            document.getElementById('HomeRoomPicture').setAttribute('src', `data:image/png;base64,${response['room']['roomPicture']}`);
        }

        // set room name and description
        document.getElementById('RoomName').innerHTML = `
        <h3 class="text-light" style="text-align: center; margin-bottom: 0">${room_name}</h3>
        `;

        document.getElementById('RoomDescription').innerHTML = `
        <p class="text-light" style="text-align: justify; text-justify: inter-word; margin-bottom: 0">${room_description}</p>
        `;
        build_change_avatar_modal()
        // Set left sidebar items
        document.getElementById('UserThumb').innerHTML = `
        <button type="button" class="btn btn-dark" data-bs-toggle="modal" data-bs-target="#ChangeAvatarModal" alt="Change Avatar">
        <img src="${avatar}" alt="${fullname}" width="30" height="30" class="rounded-circle" alt="Change Avatar">
        <span class="d-none d-sm-inline mx-1" alt="Change Avatar">${username}</span>
        </button>
        `;

        // set threads
        if (threads){
            let table = `<table class="table table-dark table-striped">
            <thead><tr><th scope="col">Title</th><th scope="col">Last Comment</th><th scope="col">Comments</th></tr></thead><tbody>
            `
            for (let i in threads){
                let t = threads[i];
                table += `
                
                <tr onclick="thread_call(${t['id']})">
                    <td>${t["name"]}</td>
                    <td>${t["lastCommentDatetime"] ? t["lastCommentDatetime"] : '-'}</td>
                    <td>${t["numComments"]}</td>
                </tr>
                
                `;
            }
            document.getElementById('HomeThreads').innerHTML = table + '</tbody></table>';
        }

        document.getElementById('SideUsername').setHTML(fullname);
    })    
}


function update_room(){
    let room_id = localStorage.getItem('room');
    let room_name = document.getElementById('EditRoomName').value.replaceAll(' ', '');
    let room_description = document.getElementById('EditRoomDescription').value.replaceAll('\n', '<br />');
    let use_default_bg = document.getElementById('EditDefaultBackground').checked;
    let show_photos = document.getElementById('EditPhotosSectionActive').checked;
    let show_articles = document.getElementById('EditArticlesSectionActive').checked;
    let show_threads = document.getElementById('EditThreadsSectionActive').checked;
    let room_picture = document.getElementById('EditRoomPicture').files[0];
    let room_bg = document.getElementById('EditRoomBackground').files[0];

    let query_filter = ` roomId: ${room_id} `;

    if (room_name){
        query_filter += ` name: "${room_name}" `;
    }
    if (room_description){
        query_filter += ` description: "${room_description}" `;
    }

    query_filter += ` defaultBackgroundActive: ${use_default_bg} `;
    query_filter += ` photosSectionActive: ${show_photos} `;
    query_filter += ` articlesSectionActive: ${show_articles} `;
    query_filter += ` threadsSectionActive: ${show_threads} `;

    query_filter = `input: { ${query_filter} }`;
    payload = `mutation{ updateRoom(${query_filter}){room{ name description roomPicture } } }`;

    const form = new FormData();
    form.append('query', payload)
    if (room_picture){
        form.append("room_picture", room_picture);
    }
    if (room_bg){
        form.append("background_picture", room_bg);
    }

    update_room_mutation(form);

}


function create_article(){
    let title = document.getElementById('NewArticleTitle').value;
    let content = document.getElementById('NewArticleContent').value.replaceAll('\n', '<br />');

    create_article_mutation(title, content).then(result => {
        if (result.errors){
            alert('Oops, something wrong happended');
        }
        else {
            window.location.href = 'home.html';
        }
    })
}


function resolve_user_articles(){
    let room_id = localStorage.getItem('room');
    articles_query(room_id).then(result => {
        let html = '';
        for (let i in result){
            let data = result[i];
            html += `
            <div class="col">
            <section class="card" style="width: 27rem">
            <div class="card-body" id="${data['id']}">
              <h5 class="card-title">${data['title']}</h5>
              <p class="card-text">${data['content']}</p>
              <div class="col-md-12 text-center">
               <p>Published: ${data['postDatetime']}</p>
              </div>
            </div>
          </section>
          </div>
            `;
        }
    document.getElementById('UserPublishedArticles').innerHTML = html;
    })
}


function resolve_user_photos(){
    let room_id = localStorage.getItem('room');
    photos_query(room_id).then(result => {
        let html = '';
        for (let i in result){
            let data = result[i];
            html += `
            <div class="col">
            <section class="card" style="width: 27rem">
            <img src="data:image/png;base64,${data['data']}" class="card-img-top"/>
            <div class="card-body" id="${data['id']}">
              <p class="card-text">${data['description']}</p>
              <div class="col-md-12 text-center">
               <small>Published: ${data['postDatetime']}</small>
              </div>
            </div>
          </section>
          </div>
            `;
        }
    document.getElementById('UserPublishedPhotos').innerHTML = html;
    })
}


function create_thread(){
    let title = document.getElementById('NewThreadTitle').value;
    let content = document.getElementById('NewThreadContent').value.replaceAll('\n', '<br />');
    let public = document.getElementById('NewThreadPublic').checked;

    create_thread_mutation(title, content, public).then(result => {
        if (result.errors){
            alert('Oops, something wrong happended');
        }
        else {
            window.location.href = 'home.html';
        }
    })
}


function resolve_thread_reply(){
    // var credentials = JSON.parse(localStorage.getItem('USER_TOKEN'));    
    // if (!credentials){
    //     alert('Log to reply!');
    //     return;
    // }

    var content = document.getElementById('ThreadReplyPostContent').value;
    var modal = document.getElementById('ThreadReplyModal');
    if (!content.trim()){
        alert('Content is required!');
        modal.click('Cancel');
        return;
    }
    var thread_id = modal.getAttribute('thread_id');

    reply_thread_mutation(thread_id, content).then(result => {
        if (result['errors']){
            alert('Oops, something wrong happened')
        }
        window.location.reload();
    })
}


function build_thread_reply_modal(thread_id){
    var modal_html = document.getElementById('THREAD_REPLY');
    modal_html.innerHTML = `
    <div class="modal fade" id="ThreadReplyModal" thread_id="${thread_id}" tabindex="-1" role="dialog" aria-labelledby="ThreadReplyModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
            <h5 class="modal-title" id="ThreadReplyModalLabel">Post reply</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
            </div>
            <div class="modal-body">
                <textarea class="form-control" id="ThreadReplyPostContent" rows="5"></textarea>
            </div>
            <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-dark" onclick="resolve_thread_reply()">Confirm</button>
            </div>
        </div>
        </div>
    </div>
    `
}


function build_thread_content_container(thread_data){
    build_thread_reply_modal(thread_data['id']);
    var thread_creator = thread_data['author']['username'];
    var creator = `<p>${thread_creator}</p>`;
    var content = thread_data['content'];

    return `
    <div class="card bg-secondary mb-3">
        <h5 class="card-header">${thread_data['name']}</h5>
        <div class="card-body bg-dark mb-3 text-white">
            <h5 class="card-title">By: ${creator}</h5>
            <p class="card-text" id="thread_content_view">${content}</p>
            <p class="card-text"><small class="text-white">${thread_data["creationDatetime"]}</small></p>
            <button type="button" class="btn btn-dark" data-bs-toggle="modal" data-bs-target="#ThreadReplyModal">Reply</button>
        </div>
    </div>
    `;
}


function get_comment_card(post_data){
    var post_creator = post_data['author']['username'];
    var creator = `<p${post_creator}</p>`;
    var avatar = post_data['author']['avatar'];
    if (!avatar){
        avatar = 'https://www.baxterip.com.au/wp-content/uploads/2019/02/anonymous.jpg';
    }
    else {
        avatar = `url("data:image/png;base64,${post_data['author']['avatar']}")`;
    }

    var content = post_data['content'];

    var html = `<div class="card text-white bg-secondary mb-3">`;
    html += '<div class="row g-0"><div class="col-md-2">';
    html += `<img src="${avatar}" class="img-thumbnail rounded-start" style="max-width: 100px;"></div>`;
    html += '<div class="col-md-8"><div class="card-body">';
    html += `<p class="card-text">${content}</p>`;
    html += `<p class="card-text"><small class="text-white">Created by: ${creator} on ${post_data["postDatetime"]}`;
    html += '</small></p></div></div></div></div><hr />';

    return html;
}


function thread_call(thread_id){
    localStorage.setItem('ThreadPage', thread_id);
    window.location.href = 'thread.html';
}


function resolve_thread(){
    thread_id = localStorage.getItem('ThreadPage');
    thread_query(thread_id).then(result => {
        var thread_div = document.getElementById('THREAD_NAME');
        thread_div.innerHTML = '';

        var comments_div = document.getElementById('POSTS');
        comments_div.innerHTML = '<hr />';
        var comments = result['comments'];

        // Adds thread title
        thread_div.innerHTML += build_thread_content_container(result);

        for (let i in  comments){
            comments_div.innerHTML += get_comment_card(comments[i]);
        }
    })
}


function upload_photo(){
    let room_id = localStorage.getItem('room');
    let description = document.getElementById('UploadPhotoDescription').value;
    let public = document.getElementById('UploadPhotoPublic').checked;
    let photo = document.getElementById('UploadPhoto').files[0];

    if (!photo){
        alert('No image selected!');
        return
    }

    let query_filter = ` roomId: ${room_id} public: ${public} `;
    if (description){
        query_filter += ` description: "${description}" `;
    }

    query_filter = `input: { ${query_filter} }`;
    let payload = `mutation{ createPhoto(${query_filter}){photo{ id } } }`;

    const form = new FormData();
    form.append('query', payload)
    form.append("photo", photo);

    create_photo_mutation(form);
}


function search_rooms(){
    let name = document.getElementById('ExploreRooms').value;
    rooms_query(name).then(rooms => {

    let table = `<table class="table table-dark table-striped">
        <thead><tr><th scope="col">Room</th><th scope="col">Username</th></thead><tbody>
        `
        for (let i in rooms){
            let room = rooms[i];
            table += `
            
            <tr onclick="room_call(${room['id']})">
                <td>${room["name"]}</td>
                <td>${room["user"]['username']}</td>
            </tr>
            `;
        }
        document.getElementById('RoomsList').innerHTML = table + '</tbody></table>';
    })
}


function room_call(room_id){
    localStorage.setItem('GoToRoom', room_id);
    window.location.href = 'room.html';
}

function resolve_room(){
    room_id = localStorage.getItem('GoToRoom');
    room_query(room_id).then(response => {
        let room_name = response['name'];
        let room_description = response['description'];
        let username = response['user']['username'];
        let fullname = response['user']['fullName'];
        let threads = response['threads'].slice(0,6);
        var avatar = response['user']['avatar'];
        if (!avatar){
            avatar = 'https://www.baxterip.com.au/wp-content/uploads/2019/02/anonymous.jpg';
        }
        else {
            avatar = `url("data:image/png;base64,${avatar}")`;
        }

        if (response['backgroundPicture'] && response['defaultBackgroundActive'] == false){
            document.getElementById("RoomBody").style.backgroundImage  = `url("data:image/png;base64,${response['backgroundPicture']}")`;
        }

        if (response['roomPicture']){
            document.getElementById('RoomPicture').setAttribute('src', `data:image/png;base64,${response['roomPicture']}`);
        }

        // set room name and description
        document.getElementById('RoomName').innerHTML = `
        <h3 class="text-light" style="text-align: center; margin-bottom: 0">${room_name}</h3>
        `;

        document.getElementById('RoomDescription').innerHTML = `
        <p class="text-light" style="text-align: justify; text-justify: inter-word; margin-bottom: 0">${room_description}</p>
        `;

        // Set left sidebar items
        document.getElementById('UserThumb').innerHTML = `
        <img src="${avatar}" alt="${fullname}" width="30" height="30" class="rounded-circle">
        <span class="d-none d-sm-inline mx-1">${username}</span>
        `;

        // set threads
        if (threads){
            let table = `<table class="table table-dark table-striped">
            <thead><tr><th scope="col">Title</th><th scope="col">Last Comment</th><th scope="col">Comments</th></tr></thead><tbody>
            `
            for (let i in threads){
                let t = threads[i];
                table += `
                
                <tr onclick="thread_call(${t['id']})">
                    <td>${t["name"]}</td>
                    <td>${t["lastCommentDatetime"] ? t["lastCommentDatetime"] : '-'}</td>
                    <td>${t["numComments"]}</td>
                </tr>
                
                `;
            }
            document.getElementById('RoomThreads').innerHTML = table + '</tbody></table>';
        }

        document.getElementById('SideUsername').setHTML(fullname);
    })
}


function resolve_room_photos(){
    let room_id = localStorage.getItem('GoToRoom');
    photos_query(room_id).then(result => {
        let html = '';
        for (let i in result){
            let data = result[i];
            html += `
            <div class="col">
            <section class="card" style="width: 27rem">
            <img src="data:image/png;base64,${data['data']}" class="card-img-top"/>
            <div class="card-body" id="${data['id']}">
              <p class="card-text">${data['description']}</p>
              <div class="col-md-12 text-center">
               <small>Published: ${data['postDatetime']}</small>
              </div>
            </div>
          </section>
          </div>
            `;
        }
    document.getElementById('UserPublishedPhotos').innerHTML = html;
    })
}


function resolve_room_articles(){
    let room_id = localStorage.getItem('GoToRoom');
    articles_query(room_id).then(result => {
        let html = '';
        for (let i in result){
            let data = result[i];
            html += `
            <div class="col">
            <section class="card" style="width: 27rem">
            <div class="card-body" id="${data['id']}">
              <h5 class="card-title">${data['title']}</h5>
              <p class="card-text">${data['content']}</p>
              <div class="col-md-12 text-center">
               <p>Published: ${data['postDatetime']}</p>
              </div>
            </div>
          </section>
          </div>
            `;
        }
    document.getElementById('UserPublishedArticles').innerHTML = html;
    })
}