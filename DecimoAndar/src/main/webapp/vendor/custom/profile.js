document.addEventListener("DOMContentLoaded", function () {
    var updateUserDataForm = document.getElementById('updateUserDataForm');

    updateUserDataForm.addEventListener('submit', function (event) {
        event.preventDefault();

        var telefone = document.getElementById('telefone').value;
        var dataNascimento = document.getElementById('datanasci').value;

        function validarTelefone(telefone) {
            const telefoneRegex = /^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/;
            return telefoneRegex.test(telefone);
        }

        function calcularIdade(dataNascimento) {
            const hoje = new Date();
            const nascimento = new Date(dataNascimento);
            let idade = hoje.getFullYear() - nascimento.getFullYear();
            const mes = hoje.getMonth() - nascimento.getMonth();
            if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
                idade--;
            }
            return idade;
        }

        var dados = {
            telefone: telefone,
            dataNascimento: dataNascimento
        };

        processarDadosUsuario(dados);

        function processarDadosUsuario(dados) {
            if (!validarTelefone(dados.telefone)) {
                alert("Telefone inválido.");
                return;
            }

            if (calcularIdade(dados.dataNascimento) < 18) {
                alert("Usuário deve ter 18 anos ou mais.");
                return;
            }

            fetch('/update-user-data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dados),
            })
                .then(response => {
                    if (response.ok) {
                        alert("Dados de usuário atualizados com sucesso!");
                        $('#modalId').modal('hide');
                        obterDadosUsuario();
                    } else {
                        return response.text().then(text => {
                            alert("Erro ao atualizar os dados do usuário:", text);
                        });
                    }
                })
                .catch(error => {
                    console.error('Erro ao atualizar os dados do usuário:', error);
                });
        }
    });

    // Função para obter os dados do usuário
    function obterDadosUsuario() {
        fetch('/profile')
            .then(response => response.json())
            .then(userData => {
                atualizarPerfil(userData);
            })
            .catch(error => {
                console.error('Erro ao obter os dados do usuário:', error);
            });
    }

    // Função para atualizar o perfil na página
    function atualizarPerfil(userData) {
        document.getElementById('nome').textContent = userData.name;
        document.getElementById('nome2').textContent = userData.name;
        document.getElementById('email').textContent = userData.email;
        document.getElementById('tel').textContent = userData.telefone;
        document.getElementById('datanascimento').textContent = userData.dataNascimento;
    }

    // Chamada da função para obter os dados do usuário quando a página é carregada
    obterDadosUsuario();

    // Função para carregar os imóveis do usuário via AJAX
    function loadImoveis() {
        $.ajax({
            type: "GET",
            url: "/list-imoveis",
            dataType: "json",
            success: function (data) {
                // Limpa o carrossel antes de adicionar os novos cards
                $("#carouselExampleIndicators2 .carousel-inner").empty();

                // Itera sobre os imóveis recebidos e adiciona os cards ao carrossel
                for (var i = 0; i < data.length; i += 3) {
                    var active = i === 0 ? 'active' : '';
                    var items = data.slice(i, i + 3);
                    var item = `
                                       <div class="carousel-item ${active}">
                                           <div class="row">
                                               ${items.map(imovel => `
                                                   <div class="col-md-4 mb-3">
                                                       <div class="card">
                                                           <img class="card-img-top img-fluid" style="height: 200px; object-fit: cover;" src="${imovel.imagePaths[0]}" alt="Imagem do Imóvel">
                                                           <div class="card-body">
                                                               <h6 class="card-title">${imovel.endereco}</h6>
                                                               <p class="card-text"><strong>CEP: </strong>${imovel.cep}</p>
                                                               <div class="d-grid gap-2 d-md-flex justify-content-md-start">
                                                                  <button class="btn btn-outline-secondary px-3 me-md-2 btn-ver" data-imovel-id="${imovel.id}">Ver</button>
                                                                  <button id="btnExcluirAnuncio-${imovel.id}" type="button" class="btn btn-outline-danger px-3 btnExcluirAnuncio"><i class="bi bi-trash3"></i> Excluir</button>
                                                               </div>
                                                           </div>
                                                       </div>
                                                   </div>
                                               `).join('')}
                                           </div>
                                       </div>
                                   `;
                    $("#carouselExampleIndicators2 .carousel-inner").append(item);
                }

                // Atualiza o carrossel
                $('#carouselExampleIndicators2').carousel();

                // Adicionar evento de clique aos botões de exclusão
                $('.btnExcluirAnuncio').click(function () {
                    var imovelId = $(this).attr('id').split('-')[1];
                    deleteImovel(imovelId);
                });
            },
            error: function () {
            }
        });
    }

    // Função para excluir um imóvel via AJAX
    function deleteImovel(imovelId) {
        $.ajax({
            type: "DELETE",
            url: `/delete-imovel?id=${imovelId}`,
            success: function () {
                alert("Imóvel excluído com sucesso!");
                loadImoveis(); // Recarrega os imóveis após a exclusão
            },
            error: function () {
                alert("Erro ao excluir imóvel.");
            }
        });
    }

    // Chama a função para carregar os imóveis ao carregar a página
    loadImoveis();

    // Função para carregar os detalhes do imóvel quando o botão "Ver" é clicado
    function loadPropertyDetails(propertyId) {
        $.ajax({
            type: "GET",
            url: `/property-details?id=${propertyId}`,
            dataType: "json",
            success: function (data) {
                // Atualiza a interface com os detalhes do imóvel
                console.log("Detalhes do Imóvel:", data);

                // Atualiza as imagens no carousel
                var carouselImages = $("#carouselImages");
                carouselImages.empty();
                data.imagePaths.forEach(function (imagePath, index) {
                    var activeClass = index === 0 ? 'active' : '';
                    var item = `
                        <div class="carousel-item ${activeClass}">
                            <img src="${imagePath}" class="d-block w-100" alt="Imagem do Imóvel">
                        </div>
                    `;
                    carouselImages.append(item);
                });

                // Atualiza o valor
                var valor = parseFloat(data.valor); // Converte para número
                $(".card-title").text("R$ " + valor.toFixed(2));

                // Atualiza os detalhes no resumo
                $(".bedrooms").text(data.numQuartos + " Quartos");
                $(".bathrooms").text(data.numBanheiros + " Banheiros");
                $(".area").text(data.metrosQuadrados + " m²");

                // Atualiza os detalhes no card de resumo 3
                $("#tipoImovel").text("Tipo: " + data.tipoImovel);
                $("#tipoVenda").text("Tipo de anúncio: " + data.tipoVenda);

                // Atualiza o endereço
                $("#logradouro").text("Logradouro: " + data.endereco);
                $("#numero").text("Número: " + data.numero);
                $("#cidade").text("Cidade: " + data.cidade);
                $("#estado").text("Estado: " + data.uf);
                $("#cep").text("CEP: " + data.cep);

                // Atualiza a descrição do imóvel
                $("#descricao").text(data.descricaoImovel);

                // Atualiza o iframe do mapa
                var iframe = `<iframe class="mt-5 border-0 rounded-3 shadow-sm"
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3654.1713889822545!2d-46.7040323183628!3d-23.669828123870488!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94ce515bb231b5ed%3A0x327b78892baef8e6!2zU2VuYWMgTmHDp8O1ZXMgVW5pZGFz!5e0!3m2!1spt-BR!2sbr!4v1716145780152!5m2!1spt-BR!2sbr"
                                    width="600" height="250" style="border:0;" allowfullscreen="" loading="lazy"
                                    referrerpolicy="no-referrer-when-downgrade"></iframe>`;
                $("#mapa").html(iframe);
            }
        });
    }
    // Função para obter os dados do usuário e verificar o telefone
    function verificarTelefoneCadastrado() {
        fetch('/profile')
            .then(response => response.json())
            .then(userData => {
                if (userData.telefone && userData.telefone.trim() !== "") {
                    window.location.href = "/pages/imovel.html";
                } else {
                    alert("Por favor, cadastre seu telefone antes de anunciar.");
                    window.location.href = "/pages/profile.html";
                }
            })
            .catch(error => {
                console.error('Erro ao obter os dados do usuário:', error);
                alert("Erro ao verificar dados do usuário.");
            });
    }

    // Adicionando evento de clique no botão "Anunciar" do perfil
    document.getElementById("btnAnunciarProfile").addEventListener("click", function () {
        verificarTelefoneCadastrado();
    });

    // Adiciona o evento de clique para carregar detalhes do imóvel quando o botão "Ver" é clicado
    $(document).on('click', '.btn-ver', function () {
        var propertyId = $(this).data('imovel-id');
        loadPropertyDetails(propertyId);
    });

    // Script para redirecionar para a página de anúncio ao clicar no botão "Ver"
    $(document).on('click', '.btn-ver', function () {
        var propertyId = $(this).data('imovel-id');
        window.location.href = `/pages/anuncio.html?id=${propertyId}`;
    });
});