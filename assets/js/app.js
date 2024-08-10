const cl = console.log;

const postform = document.getElementById("postform");
const titleControl = document.getElementById("title");
const contentControl = document.getElementById("content");
const UserIdControl = document.getElementById("UserId");
const submitbtn = document.getElementById("submitbtn");
const updatebtn = document.getElementById("updatebtn");
const postcontainer = document.getElementById("postcontainer");
const loader = document.getElementById("loader");


const BASE_URL = `https://posts-data-8d1c3-default-rtdb.asia-southeast1.firebasedatabase.app/`;

const POST_URL = `${BASE_URL}/posts.json`;

const sweetalert = (msg, iconstr) =>{
    swal.fire({
        title:msg,
        timer:2000,
        icon:iconstr
    })

}


const templatingofcard = (arr) => {

    postcontainer.innerHTML = arr.map(post => {

        return `<div class="col-md-4 mb-3">
                    <div class="card postcard h-100" id="${post.id}">
                        <div class="card-header">
                        <h3 class="m-0">${post.title}</h3>
                        </div>
                        <div class="card-body contentcss">
                        <p class="m-0">${post.body}</p>
                        </div>
                        <div class="card-footer d-flex justify-content-between">
                        <button class="btn btn btncss" onclick = "onEdit(this)">Edit</button>
                        <button class="btn btn btnrem" onclick = "onRemove(this)">Remove</button>
                        </div>
                    </div>
                </div>`

    }).join("")
    
}


const makeApiCall = (methodName, api_url, msgBody = null) =>{
    //API Call start => show loader
    loader.classList.remove(`d-none`);
    return new Promise ((resolve,reject)=>{
        let xhr = new XMLHttpRequest();

        xhr.open(methodName, api_url);

        xhr.onload = function(){
            if(xhr.status >= 200 && xhr.status < 300){
                let data = JSON.parse(xhr.response)//need to convert in obj
                resolve(data)
            }else{
                reject(`Something went wrong!!!`)
            }
            // loader.classList.add(`d-none`);
        }
         xhr.onerror = function(){
            loader.classList.add(`d-none`);
         }

        xhr.send(JSON.stringify(msgBody));
    })
}

const fetchPost = () => {
    makeApiCall("GET", POST_URL) //it gives promise hence need to consume
    .then(res =>{
        // cl(res)
        //after response callback functionality
        let postArr = [];
        for (const key in res) {
            let obj = {...res[key], id: key}
            postArr.push(obj)
            // cl(postArr); 
            }
            templatingofcard(postArr)
        })
    
    .catch(err =>{
        cl(err)
    })
    .finally(()=>{
        loader.classList.add(`d-none`);
    })
}

fetchPost()


//To create the post
const onAddpost = (eve) =>{
    eve.preventDefault();

    //create a new obj
    let newobj = {
        title:titleControl.value,
        body:contentControl.value.trim(),
        UserId:UserIdControl.value

    }

    //APIcall
    makeApiCall("POST", POST_URL, newobj)
    .then(res =>{
        cl(res)
        //Callback function
        newobj.id = res.name;
        let card = document.createElement("div");
        card.className = `col-md-4 mb-3`;
        card.innerHTML = `<div class="card postcard h-100" id="${newobj.id}">
                        <div class="card-header">
                        <h3 class="m-0">${newobj.title}</h3>
                        </div>
                        <div class="card-body contentcss">
                        <p class="m-0">${newobj.body}</p>
                        </div>
                        <div class="card-footer d-flex justify-content-between">
                        <button class="btn btn btncss" onclick = "onEdit(this)">Edit</button>
                        <button class="btn btn btnrem" onclick = "onRemove(this)">Remove</button>
                        </div>
                    </div>`
                    postcontainer.prepend(card)
                    sweetalert(`${newobj.title} is added successfully`, "success");
    })
    .catch(err =>{
        // cl(err)
        sweetalert(`error`, "error")
    })
    .finally(()=>{
        postform.reset()
        loader.classList.add(`d-none`);
    })


    
}

const onEdit = (ele) =>{
    //EditId
    let editId = ele.closest(`.card`).id;
    // cl(editId)

    localStorage.setItem("editId", editId);

    //Editurl
    let EDIT_URL = `${BASE_URL}/posts/${editId}.json`;


    //API call
    makeApiCall("GET", EDIT_URL)
    .then(res =>{
        cl(res)
        //callback function
        titleControl.value = res.title;
        contentControl.value = res.body;
        UserIdControl.value = res.UserId

    })
    .catch(err =>{
        cl(err)
    })
    .finally(()=>{
        window.scrollTo(0,0,"smooth")
        loader.classList.add(`d-none`);
        updatebtn.classList.remove(`d-none`);
        submitbtn.classList.add(`d-none`);
    })

    
}

const onUpdatepost = () =>{
    //updateId
    let updateId = localStorage.getItem("editId");
    // cl(updateId)


    //updateUrl

    let UPDATE_URL = `${BASE_URL}/posts/${updateId}.json`

    //Updatedobj

    let updatedobj = {
        title:titleControl.value,
        body:contentControl.value.trim(),
        UserId:UserIdControl.value
    }


    //APICall
    makeApiCall("PATCH",UPDATE_URL, updatedobj)
    .then(res =>{
        cl(res)
        //Callback function
    let card = [...document.getElementById(updateId).children];
    // cl(card);
    card[0].innerHTML = `<h3 class="m-0">${updatedobj.title}</h3>`;
    card[1].innerHTML = `<p class="m-0">${updatedobj.body}</p>`
    sweetalert(`${updatedobj.title} is updated successfully`, "success")
    })

    .catch(err =>{
        sweetalert(`error`, "error")
    })
    .finally(()=>{
        loader.classList.add(`d-none`);
        updatebtn.classList.add(`d-none`);
        submitbtn.classList.remove(`d-none`);
        postform.reset()
    })


}


const onRemove = (ele) =>{

    Swal.fire({
        title: "Are you sure?",
        text: "You won't be this card!!!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, remove it!"
      }).then((result) => {
        if (result.isConfirmed) {
          //RemoveId
    let RemoveId = ele.closest(`.card`).id;
    cl(RemoveId)


    //RemoveURL
    let REMOVE_URL = `${BASE_URL}/posts/${RemoveId}.json`


    //APICall
    makeApiCall("DELETE", REMOVE_URL)
    .then(res =>{
        // cl(res)
        //callback
        ele.closest(`.card`).parentElement.remove()
    })
    .catch(err =>{
        cl(err)
    })
    .finally(()=>{
        loader.classList.add(`d-none`);
        
    })
        }
      });
    


    
}





postform.addEventListener("submit", onAddpost);
updatebtn.addEventListener("click", onUpdatepost);