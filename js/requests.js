const url = 'https://myroombackend.brunolcarli.repl.co/graphql/';


function status(response) {
    if (response.status >= 200 && response.status < 300) {
        return Promise.resolve(response)
    } else {
        return Promise.reject(new Error(response.statusText))
    }
};

function json(response) {
    return response.json()
};

function get_request_options(payload) {
    return {
        method: 'POST',
        headers: {
            cookie: 'csrftoken=pgrjljBkHdbd9hySxmJaFUlewPM1IdYJ09nZstz9N6bCf8pfuctT4ftl2girhj6t',
            'Content-Type': 'application/json'
        },
        body: payload
    };
};



function signin_mutation(email, password) {
    let payload = `{"query": "mutation{ signIn(input: {email: \\\"${email}\\\" password: \\\"${password}\\\"}){ token } }"}`;
    let options = get_request_options(payload);
    return fetch(url, options)
        .then(json)
        .then(response => {
            return response['data']['signIn']['token'];
        })
        .catch(err => {
            console.error(err);
        });
};


function signup_mutation(email, username, fullname, password, birthdate) {
    let payload = `{"query": "mutation{ signUp(input: {email: \\\"${email}\\\" password: \\\"${password}\\\" username: \\\"${username}\\\" fullName: \\\"${fullname}\\\" birthdate: \\\"${birthdate}\\\"}){ user{ id } } }"}`;
    let options = get_request_options(payload);
    return fetch(url, options)
        .then(json)
        .then(response => {
            return response;
        })
        .catch(err => {
            console.error(err);
        });
};


function user_query(){
    let email = localStorage.getItem('email');
    let token = localStorage.getItem('session_token');
    let payload = `{"query":"query{user(email: \\\"${email}\\\"){username fullName dateJoined avatar room{id name description defaultBackgroundActive photosSectionActive articlesSectionActive threadsSectionActive roomPicture backgroundPicture  threads{ id name numComments lastCommentDatetime } } }}"}`
    let options = get_request_options(payload);
    options['headers']['Authorization'] = `JWT ${token}`;
    return fetch(url, options)
        .then(json)
        .then(response => {
            return response['data']['user']
        })
        .catch(err => console.error(err));
}


function update_room_mutation(payload){
    let token = localStorage.getItem('session_token');

    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", (event) => {
        window.location.href = 'home.html';
    });
    XHR.addEventListener("error", (event) => {
        alert("Oops! Something went wrong.");
    });
    XHR.open("POST", url);
    XHR.setRequestHeader('Authorization', `JWT ${token}`);
    XHR.send(payload);
}


function create_photo_mutation(payload){
    let token = localStorage.getItem('session_token');

    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", (event) => {
        window.location.href = 'user_photos.html';
    });
    XHR.addEventListener("error", (event) => {
        alert("Oops! Something went wrong.");
    });
    XHR.open("POST", url);
    XHR.setRequestHeader('Authorization', `JWT ${token}`);
    XHR.send(payload);
}

function update_user_mutation(payload){
    let token = localStorage.getItem('session_token');

    const XHR = new XMLHttpRequest();
    XHR.addEventListener("load", (event) => {
        window.location.href = 'home.html';
    });
    XHR.addEventListener("error", (event) => {
        alert("Oops! Something went wrong.");
    });
    XHR.open("POST", url);
    XHR.setRequestHeader('Authorization', `JWT ${token}`);
    XHR.send(payload);
}


function create_article_mutation(title, content) {
    let payload = `{"query": "mutation{ createArticle(input: {title: \\\"${title}\\\" content: \\\"${content}\\\"}){ article{ id title } } }"}`;
    let token = localStorage.getItem('session_token');
    let options = get_request_options(payload);
    options['headers']['Authorization'] = `JWT ${token}`;
    return fetch(url, options)
        .then(json)
        .then(response => {
            return response;
        })
        .catch(err => {
            console.error(err);
        });
};


function create_thread_mutation(title, content, public) {
    let payload = `{"query": "mutation{ createThread(input: {name: \\\"${title}\\\" content: \\\"${content}\\\" public: ${public}}){ thread{ id name } } }"}`;
    let token = localStorage.getItem('session_token');
    let options = get_request_options(payload);
    options['headers']['Authorization'] = `JWT ${token}`;
    return fetch(url, options)
        .then(json)
        .then(response => {
            return response;
        })
        .catch(err => {
            console.error(err);
        });
};


function reply_thread_mutation(thread_id, content) {
    let payload = `{"query": "mutation { createThreadComment(input: { threadId: ${thread_id} content: \\\"${content}\\\"  }){ threadComment{ content postDatetime } } }"}`;
    let token = localStorage.getItem('session_token');
    let options = get_request_options(payload);
    options['headers']['Authorization'] = `JWT ${token}`;
    return fetch(url, options)
        .then(json)
        .then(response => {
            return response;
        })
        .catch(err => {
            console.error(err);
        });
};


function articles_query(room_id) {
    let payload = `{"query": "query{ articles(roomId: ${room_id}){ id title content postDatetime } }"}`;
    let token = localStorage.getItem('session_token');
    let options = get_request_options(payload);
    options['headers']['Authorization'] = `JWT ${token}`;
    return fetch(url, options)
        .then(json)
        .then(response => {
            return response['data']['articles'];
        })
        .catch(err => {
            console.error(err);
        });
};


function thread_query(thread_id) {
    let payload = `{"query": "query{ thread(id: ${thread_id}){ id name content creationDatetime author{username avatar}  comments {id author{username avatar} postDatetime content}} }"}`;
    let token = localStorage.getItem('session_token');
    let options = get_request_options(payload);
    options['headers']['Authorization'] = `JWT ${token}`;
    return fetch(url, options)
        .then(json)
        .then(response => {
            return response['data']['thread'];
        })
        .catch(err => {
            alert(err)
            console.error(err);
        });
};


function photos_query(room_id) {
    let payload = `{"query": "query {photos(roomId: ${room_id}){id data description public postDatetime}}"}`;
    let token = localStorage.getItem('session_token');
    let options = get_request_options(payload);
    options['headers']['Authorization'] = `JWT ${token}`;
    return fetch(url, options)
        .then(json)
        .then(response => {
            return response['data']['photos'];
        })
        .catch(err => {
            console.error(err);
        });
};


function rooms_query(name) {
    let payload = `{"query": "query s{ rooms(name_Icontains: \\\"${name}\\\"){ id name user{ username } } }"}`;
    let token = localStorage.getItem('session_token');
    let options = get_request_options(payload);
    options['headers']['Authorization'] = `JWT ${token}`;
    return fetch(url, options)
        .then(json)
        .then(response => {
            return response['data']['rooms'];
        })
        .catch(err => {
            console.error(err);
        });
};


function room_query(room_id) {
    let payload = `{"query": "query r{ room(id: ${room_id}){ name description roomPicture user{ username avatar fullName }  photosSectionActive articlesSectionActive threadsSectionActive defaultBackgroundActive  backgroundPicture threads{ id  name lastCommentDatetime public numComments } } }"}`;
    let token = localStorage.getItem('session_token');
    let options = get_request_options(payload);
    options['headers']['Authorization'] = `JWT ${token}`;
    return fetch(url, options)
        .then(json)
        .then(response => {
            return response['data']['room'];
        })
        .catch(err => {
            console.error(err);
        });
};