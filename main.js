let currentPage = 1;

const API = `http://localhost:8001/contact?_page=${currentPage}&_limit=3`

const secondApi = `http://localhost:8001/contact`


let contactName = $('#contact-name');
let contactLastName = $('#contact-last');
let contactNumber = $('#contact-number');
let contactImage = $('#contact-image');
let contactDepartment = $('#contact-department');
let modal = $('.modal');
let btnSave = $('.btn-save');

//? CREATE

async function addContact(){
    let name = contactName.val();
    let lastName = contactLastName.val();
    let number = contactNumber.val();
    let image = contactImage.val();
    let department = contactDepartment.val();
    let contact = {
        name,
        lastName,
        number,
        image,
        department,
    };
    try{
        const response = await axios.post(API, contact)
        Toastify({
            text: response.statusText,
            duration: 3000,
            newWindow: true,
            close: true,
            gravity: "top",
            position: "left", // `left`, `center` or `right`
            stopOnFocus: true,
            style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
            },
        }).showToast();
        modal.modal("hide")
    }catch(e){
        console.log(e);
        Toastify({
            text: e.response.statusText,
            duration: 3000,
            newWindow: true,
            close: true,
            gravity: "top", // `top` or `bottom`
            position: "center", // `left`, `center` or `right`
            stopOnFocus: true, // Prevents dismissing of toast on hover
            style: {
              background: "red",
            }
        }).showToast()
    }
    render(API)
}

btnSave.on('click', addContact)


//! Read

let list = $('.list')
let prev = $('.prev')
let next = $('.next')

async function render(url) {
    try{
        const response = await axios(url)
        // console.log(response.headers.link);
        list.html("")
        response.data.forEach(item => {
            list.append(`
            <div class="card mt-3 mb-3 bg-light" style="width: 20rem;">
                <img style="width: 100%; object-fit: contain; height: 200px;" src=${item.image} class="card-img-top" alt="...">
                <div class="card-body">
                <h5 class="card-title">${item.name}</h5>
                <p class="card-text">${item.lastName}</p>
                <h6>Department:<p>${item.department}</p></h6>
                <a href="#">${item.number}</a>
                <button id=${item.id} type="button" class="btn btn-secondary edit-btn" data-bs-toggle="modal" data-bs-target="#editModal">
                    Change
                </button>
                <button id=${item.id} type="button" class="btn btn-danger delete-btn">
                    Delete
                </button>
            </div>
        </div>
            `)
        })
        //!Pagination
        let links = response.headers.link.match(/(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gim)
        if(!links){
            prev.attr('disabled', 'true')
            next.attr('disabled', 'true')
        } 
        if(links.length === 4) {
            prev.attr('id', links[1])
            next.attr('id', links[2])
            prev.removeAttr('disabled')
            next.removeAttr('disabled')
        } else if(links.length === 3 && currentPage === 1){
            prev.attr('disabled', 'true')
            next.attr('id', links[1])
        } else if(links.length === 3 && currentPage !== 1){
            next.attr('disabled', 'true')
            prev.attr('id', links[1])
        }
    }catch(e) {
        console.log(e);
    }
}

render(API)

next.on('click', (e) => {
    let url = e.target.id 
    render(url)
    currentPage++
})

prev.on('click', (e) => {
    let url = e.target.id
    render(url)
    currentPage--
})


//!Search
let searchInp = $('.inp-search')
searchInp.on('input', (e) => {
    let value = e.target.value
    let url = `${API}&q=${value}`
    render(url)
})


//!Update 
let contactNameEdit = $('#contact-name-edit')
let contactLastEdit = $('#contact-last-edit')
let contactNumberEdit = $('#contact-number-edit')
let contactImageEdit = $('#contact-image-edit')
let contactDepartmentEdit = $('#contact-deparment-edit')
let btnSaveEdit = $('.btn-save-edit')


$(document).on('click', ".edit-btn", async (e) => {
    let id = e.target.id
    try {
        const response = await axios(`${secondApi}/${id}`)
        contactNameEdit.val(response.data.name)
        contactLastEdit.val(response.data.lastName)
        contactImageEdit.val(response.data.image)
        contactNumberEdit.val(response.data.number)
        contactDepartmentEdit.val(response.data.department)
        btnSaveEdit.attr('id', id)
    } catch(e) {
        console.log(e);
    }
})

btnSaveEdit.on('click', async (e) => {
    let id = e.target.id
    let name = contactNameEdit.val()
    let lastName = contactLastEdit.val()
    let number = contactNumberEdit.val()
    let image = contactImageEdit.val()
    let department = contactDepartmentEdit.val()



     let contact = {
         name, 
         number,
         image,
         lastName,
         department
     };
     try{
        await axios.patch(`${secondApi}/${id}`, contact)
        modal.modal("hide")
        let url = `http://localhost:8000/contact?_page=${currentPage}&_limit=3`
        render(url)
     } catch(e) {
         console.log(e);
     }
})

//! Delete
$(document).on('click', '.delete-btn', async (e) => {
    let id = e.target.id
    await axios.delete(`${secondApi}/${id}`)
    render(API)
})