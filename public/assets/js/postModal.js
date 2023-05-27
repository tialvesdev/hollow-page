function openPostModal(wrapper, idPost, post) {
    var wrapperTag = document.getElementById(wrapper);
    var postModal = document.getElementById('post_modal');
    var postSelected = post;

    // var allPosts = JSON.parse(arrPosts)

    // allPosts.forEach(post => {
    //     if (post.idPostagem == idPost) {
    //         postSelected = post;
    //     }
    // });

    postSelected = arrPosts;

    if (postSelected.fotoPerfilSrc == null) {
        document.getElementById('modal_prof_pic').src = `../assets/img/icon/user-icon.png`;                      
    } else {
        document.getElementById('modal_prof_pic').src = `../assets/bucket/${postSelected.fotoPerfilSrc}`;
    }

    // document.getElementById('modal_prof_pic').src = `../assets/bucket/${postSelected.fotoPerfilSrc}`;


    wrapperTag.style.filter = 'brightness(50%)';

    postModal.style.display = 'flex';
    postModal.style.width = '70%';
    postModal.style.padding = '0 25px 25px 25px';
    postModal.style.opacity = '1';

    // console.log(usuario[idPost]);

    document.getElementById('modal_prof_info').setAttribute('href', `./profile.html`);
    document.getElementById('modal_prof_name').innerHTML = postSelected.nome;
    document.getElementById('modal_post').src = `../assets/bucket/${postSelected.postSrc}`;
    document.getElementById('modal_date').innerHTML = postSelected.dtPostagem;
    document.getElementById('modal_title').innerHTML = postSelected.titulo;
    document.getElementById('modal_desc').innerHTML = postSelected.descricao;
    document.getElementById('modal_download_a').setAttribute('download', `${postSelected.titulo}-${postSelected.nome}`);
    document.getElementById('modal_download_a').setAttribute('href', `../assets/bucket/${postSelected.fotoPerfilSrc}`);
    document.getElementById('modal_save').addEventListener('click', () => {
        salvarPost(postSelected.idPostagem)
    });

}

function closePostModal(wrapper) {
    var wrapperTag = document.getElementById(wrapper);
    var postModal = document.getElementById('post_modal');

    wrapperTag.style.filter = 'none';

    postModal.style.display = 'none';
    postModal.style.width = '0';
    postModal.style.padding = '0';
    postModal.style.opacity = '0';
}

// function salvarPost(idPostagem) {
//     fetch(`/posts/save/${idPostagem}/${sessionStorage.ID_USUARIO}`, {
//         method: "POST"
//     })
//         .then(res => {
//             if (res.ok) {
//                 Swal.fire({
//                     icon: 'success',
//                     title: 'Postagem salva!',
//                     background: '#000',
//                     color: '#FFF',
//                     confirmButtonText: 'Beleza!',
//                 });
//             } else {
//                 throw ("Houve um erro ao tentar salvar a postagem!");
//             }

//         })
//         .catch(err => {
//             console.log(err);
//         })
// }