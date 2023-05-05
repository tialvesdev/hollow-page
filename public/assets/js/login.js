// ES6 Modules or TypeScript
import Swal from '../../node_modules/sweetalert2/src/sweetalert2.js'

// CommonJS
// import { fire } from 'sweetalert2';

// import Swal from 'sweetalert2';
// import Swal from 'sweetalert2';

function login() {
    var dadosLogin = [
        ipt_login_email.value,
        ipt_login_password.value
    ];

    if (dadosLogin[0] == "" || dadosLogin[0] == undefined) {
        fire({
            icon: 'error',
            title: 'Email inválido',
            text: 'Digite um email...'
        });
    } else if (dadosLogin[1] == "" || dadosLogin[1] == undefined) {
        console.log('Senha Inválida, digite uma senha.')
    } else {

        if (dadosLogin[0].includes('@') || dadosLogin[0].substring(dadosLogin[0].indexOf('@')) != "") {

        }

        if (dadosLogin[1].length >= 3) {

        }

    }
}

function entrar() {

}