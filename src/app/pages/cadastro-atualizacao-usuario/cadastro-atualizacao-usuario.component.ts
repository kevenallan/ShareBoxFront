import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { UsuarioService } from '../../core/services/usuario.service';
import { Usuario } from '../../core/models/usuario.model';
import { AuthService } from '../../core/services/auth.service';
import { LoginDTO } from '../../core/dto/login.dto';
import { AlertService } from '../../core/services/alert.service';
import { MenuComponent } from '../../shared/components/menu/menu.component';

@Component({
    selector: 'app-cadastro-atualizacao-usuario',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        //PRIMENG
        ButtonModule,
        TooltipModule,
        MenuComponent
    ],
    templateUrl: './cadastro-atualizacao-usuario.component.html',
    styleUrl: './cadastro-atualizacao-usuario.component.scss'
})
export class CadastroAtualizacaoUsuarioComponent implements OnInit {
    cadastroAtualizacaoForm!: FormGroup;
    isEditarPerfil: boolean = false;
    msgVoltar = 'Voltar para a tela de login';
    constructor(
        private router: Router,
        private formBuilder: FormBuilder,
        private usuarioService: UsuarioService,
        private authService: AuthService
    ) {}

    async ngOnInit(): Promise<void> {
        this.cadastroAtualizacaoForm = this.formBuilder.group(
            {
                nome: ['', Validators.required],
                email: [
                    '',
                    [
                        Validators.required,
                        Validators.email,
                        Validators.pattern(
                            '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'
                        )
                    ]
                ],
                usuario: ['', [Validators.required, Validators.minLength(3)]],
                senha: ['', [Validators.required, Validators.minLength(3)]],
                confirmarSenha: ['', Validators.required]
            },
            { validators: this.senhasIguais }
        );

        if (this.router.url === '/editar-perfil') {
            this.isEditarPerfil = true;
            this.msgVoltar = 'Voltar para a tela inicial';
            const usuarioLogado = await this.usuarioService.dadosUsuario();
            this.cadastroAtualizacaoForm.setValue({
                nome: usuarioLogado.nome,
                email: usuarioLogado.email,
                usuario: usuarioLogado.usuario,
                senha: usuarioLogado.senha,
                confirmarSenha: usuarioLogado.senha
            });
        }
    }

    senhasIguais(formGroup: FormGroup) {
        return formGroup.get('senha')?.value ===
            formGroup.get('confirmarSenha')?.value
            ? null
            : { senhasDiferentes: true };
    }

    onSubmit() {
        if (this.cadastroAtualizacaoForm.valid) {
            if (this.isEditarPerfil) {
                this.atualizarUsuario();
            } else {
                this.cadastrar();
            }
        } else {
            // Marcar todos os campos como "tocados" para mostrar mensagens de erro
            this.cadastroAtualizacaoForm.markAllAsTouched();
        }
    }

    voltar() {
        this.router.navigate(['/login']);
    }

    cadastrar() {
        const usuario: Usuario = this.getUsuario();

        this.usuarioService
            .cadastro(usuario)
            .subscribe((loginDTO: LoginDTO) => {
                if (loginDTO.token) {
                    this.authService.setTokenStorage(loginDTO.token);
                    this.router.navigate(['/inicio']);
                }
            });
    }

    async atualizarUsuario() {
        const usuario: Usuario = this.getUsuario();

        await this.usuarioService.atualizarUsuario(usuario);
    }
    getUsuario() {
        const form = this.cadastroAtualizacaoForm;

        const usuario: Usuario = {
            nome: form.get('nome')?.value,
            email: form.get('email')?.value,
            usuario: form.get('usuario')?.value,
            senha: form.get('senha')?.value
        };
        return usuario;
    }
}
