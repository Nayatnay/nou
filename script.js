const canvas = document.getElementById('canvasFranela');
const input = document.getElementById('upload');

let ctx = null;
if (canvas) {
    ctx = canvas.getContext('2d');
}

let carrito = JSON.parse(localStorage.getItem('nouCarrito')) || [];
let imgUsuario = null;
const imgBase = new Image();

// --- CONFIGURACIÓN DE POSICIONES ---
const posiciones = {
    "Centro Pecho": { vista: 'frente', x: 410, y: 220 },
    "Corazón": { vista: 'frente', x: 520, y: 210 },
    "Espalda": { vista: 'espalda', x: 410, y: 220 }
};

// --- CONFIGURACION TAMAÑOS PERSONALIZADAS ---
const opcionesTamano = {
    "10cm": 100,
    "20cm": 300,
    "30cm": 400
};

// --- INICIALIZACIÓN ---
imgBase.src = 'assets/mockup-base.png';
imgBase.onload = () => {
    if (canvas && ctx) dibujarTodo();
};

function dibujarTodo() {
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgBase, 0, 0, canvas.width, canvas.height);

    const ubicacion = document.getElementById('ubicacion') ? document.getElementById('ubicacion').value : "Centro Pecho";
    const selectTamano = document.getElementById('tamano');
    const tamanoSeleccionado = selectTamano ? selectTamano.value : "20cm";
    const pos = posiciones[ubicacion] || posiciones["Centro Pecho"];
    const tamanoEnPixeles = opcionesTamano[tamanoSeleccionado] || 300;

    if (imgUsuario) {
        dibujarEstampaEnCanvas(pos, tamanoEnPixeles);
    }
}

function actualizarPrevisualizacion() {
    if (!canvas || !ctx) return;

    const ubicacion = document.getElementById('ubicacion').value;
    const selectTamano = document.getElementById('tamano');

    if (ubicacion === "Corazón") {
        selectTamano.value = "10cm";
        selectTamano.disabled = true;
    } else {
        selectTamano.disabled = false;
    }

    const tamanoSeleccionado = selectTamano.value;
    const pos = posiciones[ubicacion];
    const tamanoEnPixeles = opcionesTamano[tamanoSeleccionado] || 300;

    const vista = (pos.vista === 'espalda') ? 'espalda' : 'frente';
    const nuevaRuta = mockups[colorActual][vista];

    if (imgBase.src.indexOf(nuevaRuta) === -1) {
        imgBase.src = nuevaRuta;
        imgBase.onload = () => dibujarTodoConTamano(pos, tamanoEnPixeles);
        return;
    }

    dibujarTodoConTamano(pos, tamanoEnPixeles);
    scrollToCustomizer();
}

function dibujarTodoConTamano(pos, tamano) {
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgBase, 0, 0, canvas.width, canvas.height);

    if (imgUsuario) {
        dibujarEstampaEnCanvas(pos, tamano);
    }
}

function dibujarEstampaEnCanvas(pos, tamano) {
    const escalaPantalla = canvas.clientWidth / 800;
    const factorEscala = Math.max(escalaPantalla, 0.75);

    const sizeEscalado = tamano * factorEscala;
    let ratio = Math.min(sizeEscalado / imgUsuario.width, sizeEscalado / imgUsuario.height);
    let w = imgUsuario.width * ratio;
    let h = imgUsuario.height * ratio;

    let x = pos.x - (w / 2);
    const posicionCuelloY = 120;
    const espacioDesdeCuello = 50;
    let y = posicionCuelloY + espacioDesdeCuello;

    ctx.drawImage(imgUsuario, x, y, w, h);
}

// --- EVENTOS Y CARRITO ---
if (input) {
    input.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            imgUsuario = new Image();
            imgUsuario.onload = () => {
                actualizarPrevisualizacion();
            };
            imgUsuario.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function agregarAlCarrito(prod) {
    carrito.push(prod);
    localStorage.setItem('nouCarrito', JSON.stringify(carrito));
    renderizarCarrito();
}

function actualizarEstadoBotonWhatsApp() {
    const botonWhatsApp = document.getElementById('btn-whatsapp');
    if (!botonWhatsApp) return;

    if (carrito.length === 0) {
        botonWhatsApp.disabled = true;
        botonWhatsApp.classList.add('disabled');
    } else {
        botonWhatsApp.disabled = false;
        botonWhatsApp.classList.remove('disabled');
    }
}

function renderizarCarrito() {
    const lista = document.getElementById('lista-carrito');
    const cont = document.getElementById('contador');

    if (lista) {
        lista.innerHTML = '';
        if (carrito.length === 0) {
            lista.innerHTML = "<li style='justify-content: center; color: #777; border:none;'>Tu lista está vacía</li>";
        } else {
            carrito.forEach((item, i) => {
                if (typeof item === 'object' && item !== null) {
                    const esPersonalizada = item.id && item.id.startsWith("custom");

                    const subtituloDetalle = esPersonalizada
                        ? `Color: ${item.color} | Talla: ${item.talla} <br>Ubicación: ${item.ubicacion} (${item.tamanoDiseno})`
                        : `Colección: ${item.coleccion.toUpperCase()} | Color: ${item.color} | Talla: ${item.talla} <br>Cantidad: ${item.cantidad}`;

                    const precioMostrar = esPersonalizada ? "$15.00 USD" : item.precioTexto;

                    lista.innerHTML += `
                        <li>
                            <img src="${item.miniatura}" alt="Miniatura" class="carrito-miniatura">
                            <div class="carrito-info-item">
                                <strong>${item.tipo}</strong>
                                <span>${subtituloDetalle}</span>
                                <span style="font-weight: bold; color: #000; margin-top: 2px;">${precioMostrar}</span>
                            </div>
                            <button onclick="eliminar(${i})" class="btn-eliminar" title="Eliminar producto">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                            </button>
                        </li>`;
                } else {
                    lista.innerHTML += `
                        <li>
                            <span style="flex-grow: 1; padding-right: 10px;">${item}</span>
                            <button onclick="eliminar(${i})" class="btn-eliminar" title="Eliminar producto">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    <line x1="10" y1="11" x2="10" y2="17"></line>
                                    <line x1="14" y1="11" x2="14" y2="17"></line>
                                </svg>
                            </button>
                        </li>`;
                }
            });
        }
    }
    if (cont) cont.innerText = carrito.length;
    actualizarEstadoBotonWhatsApp();
}

function eliminar(i) {
    carrito.splice(i, 1);
    localStorage.setItem('nouCarrito', JSON.stringify(carrito));
    renderizarCarrito();
}

function enviarPedido() {
    if (carrito.length === 0) return;

    // 1. Generamos el texto de cada producto
    const textosPedido = carrito.map(item => {
        if (typeof item === 'object' && item !== null) {
            if (item.id && item.id.startsWith("custom")) {
                return `• Franela personalizada (Base: ${item.color} - *Consultar tono exacto por WhatsApp*, Talla: ${item.talla}, Ubicación: ${item.ubicacion}, Tamaño: ${item.tamanoDiseno}) - $15.00 USD`;
            } else {
                return `• ${item.cantidad}x ${item.tipo} (${item.precioTexto} c/u) - [Base: ${item.color} - *Consultar tono exacto por WhatsApp*, Talla: ${item.talla}]`;
            }
        }
        return `• ${item}`;
    });

    const mensajeFinal = "Hola, quiero pedir los siguientes productos:%0A" + textosPedido.join("%0A");

    // 2. Vaciamos el carrito y actualizamos la interfaz antes de abrir WhatsApp
    vaciarCarrito();

    // 3. Abrimos WhatsApp
    window.open(`https://wa.me/584126067734?text=${mensajeFinal}`, '_blank');
}

function vaciarCarrito() {
    carrito = [];
    localStorage.removeItem('nouCarrito');
    renderizarCarrito();
    cerrarModal();
}

function abrirModal() {
    const modal = document.getElementById('modalCarrito');
    if (modal) {
        modal.style.display = "block";
        actualizarEstadoBotonWhatsApp();
    }
}

function cerrarModal() {
    const modal = document.getElementById('modalCarrito');
    if (modal) modal.style.display = "none";
}

function mostrarNombreArchivo() {
    const inputArchivo = document.getElementById('upload');
    const spanNombre = document.getElementById('file-name');
    const boton = document.querySelector('.btn-comprar');

    if (inputArchivo.files.length > 0) {
        spanNombre.textContent = inputArchivo.files[0].name;
        boton.disabled = false;
        boton.classList.remove('is-disabled');
    } else {
        spanNombre.textContent = '';
        boton.disabled = true;
        boton.classList.add('is-disabled');
    }
}

function agregarPersonalizado() {
    const inputArchivo = document.getElementById('upload');
    const u = document.getElementById('ubicacion').value;
    const t = document.getElementById('tamano').value;
    const talla = document.getElementById('talla-franela').value;
    const boton = document.querySelector('.btn-comprar');

    const colorActualStr = typeof colorActual !== 'undefined' ? colorActual : 'claro';
    const colorFormateado = colorActualStr.charAt(0).toUpperCase() + colorActualStr.slice(1);

    if (inputArchivo.files.length === 0) {
        alert('Por favor, selecciona un diseño para tu franela antes de continuar.');
        inputArchivo.click();
        return;
    }

    actualizarPrevisualizacion();

    setTimeout(() => {
        const imagenMiniatura = canvas.toDataURL("image/png");

        const itemPersonalizado = {
            id: "custom-" + Date.now(),
            tipo: "Franela personalizada",
            color: colorFormateado,
            talla: talla,
            ubicacion: u,
            tamanoDiseno: t,
            miniatura: imagenMiniatura,
            precio: 15.00,
            cantidad: 1
        };

        agregarAlCarrito(itemPersonalizado);

        const textoOriginal = boton.innerHTML;
        boton.innerHTML = 'Agregando. Espere...';
        boton.classList.add('btn-exito');
        boton.disabled = true;

        setTimeout(() => {
            boton.innerHTML = textoOriginal;
            boton.classList.remove('btn-exito');
            if (inputArchivo.files.length > 0) {
                boton.disabled = false;
                boton.classList.remove('is-disabled');
            }
        }, 2500);
    }, 50);
}

document.addEventListener("DOMContentLoaded", function () {
    const inputArchivo = document.getElementById('upload');
    const boton = document.querySelector('.btn-comprar');

    if (inputArchivo && inputArchivo.files.length === 0 && boton) {
        boton.disabled = true;
        boton.classList.add('is-disabled');
    }
});

renderizarCarrito();

function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    if (navLinks) navLinks.classList.toggle('active');
}

document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.getElementById('navLinks');
    if (navLinks) {
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                }
            });
        });
    }
    actualizarEstadoBotonWhatsApp();
});

function cambiarImagen(idCarrusel, direccion) {
    const contenedor = document.getElementById(idCarrusel);
    if (!contenedor) return;
    const imagenes = contenedor.querySelectorAll('.imagenes-container img');
    let indiceActual = Array.from(imagenes).findIndex(img => img.classList.contains('activa'));

    if (indiceActual !== -1) {
        imagenes[indiceActual].classList.remove('activa');
        let nuevoIndice = (indiceActual + direccion + imagenes.length) % imagenes.length;
        imagenes[nuevoIndice].classList.add('activa');
    }
}

function verDetalle(coleccion, idImagen) {
    const contenedor = document.getElementById(`carrusel-${coleccion}`);
    if (contenedor) {
        const imagenes = contenedor.querySelectorAll('.imagenes-container img');
        const indiceActivo = Array.from(imagenes).findIndex(img => img.classList.contains('activa'));
        if (indiceActivo !== -1) {
            idImagen = indiceActivo;
        }
    }
    window.location.href = `detalle.html?coleccion=${coleccion}&id=${idImagen}`;
}

document.addEventListener("DOMContentLoaded", function () {
    const track = document.querySelector('.carousel-track');
    if (!track) return;

    if (window.innerWidth > 768) {
        const originalCards = Array.from(track.children);
        for (let i = 0; i < 2; i++) {
            originalCards.forEach(card => {
                track.appendChild(card.cloneNode(true));
            });
        }
    }
});

let colorActual = 'claro';

const mockups = {
    claro: {
        frente: 'assets/mockup-base.png',
        espalda: 'assets/mockup-espalda.png'
    },
    oscuro: {
        frente: 'assets/mockup-base-b.png',
        espalda: 'assets/mockup-espalda-b.png'
    }
};

function cambiarColor(color) {
    colorActual = color;
    const botones = document.querySelectorAll('.color-btn');
    botones.forEach(btn => {
        if (btn.textContent.toLowerCase() === color) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    actualizarPrevisualizacion();
    scrollToCustomizer();
}

document.addEventListener("DOMContentLoaded", function () {
    const forms = document.querySelectorAll(".ajax-form");

    forms.forEach(form => {
        const submitBtn = form.querySelector("button[type='submit']");
        const container = form.closest("section, div");
        const successMsg = container ? container.querySelector(".form-success-msg") : null;
        const originalText = submitBtn ? submitBtn.textContent : "Enviar";

        form.addEventListener("submit", async function (event) {
            event.preventDefault();

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = "Enviando...";
            }

            const formData = new FormData(form);

            try {
                const response = await fetch(form.action, {
                    method: form.method,
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    if (successMsg) successMsg.style.display = "block";
                    form.reset();
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;
                    }
                } else {
                    alert("Hubo un problema al procesar tu suscripción. Inténtalo de nuevo.");
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.textContent = originalText;
                    }
                }
            } catch (error) {
                alert("Error de conexión. Verifica tu red.");
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            }
        });
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const coleccion = urlParams.get('coleccion');
    const id = urlParams.get('id');

    if (coleccion && id !== null) {
        const imgProd = document.getElementById('imagen-producto');
        const titProd = document.getElementById('titulo-producto');
        const precioProd = document.getElementById('precio-producto');
        const spanColeccion = document.getElementById('nombre-coleccion-detalle');
        const enlaceProducto = document.getElementById("enlaceProducto");
        const tituloPagina = document.querySelector('.page-title');

        const rutaImagenGrande = `assets/grande/${coleccion}/${id}.webp`;

        if (imgProd) imgProd.src = rutaImagenGrande;
        if (enlaceProducto) enlaceProducto.href = rutaImagenGrande;

        let textoColeccionFinal = "";
        if (spanColeccion) {
            const coleccionFormateada = coleccion.charAt(0).toUpperCase() + coleccion.slice(1);
            textoColeccionFinal = `Colección ${coleccionFormateada}`;
            spanColeccion.innerText = textoColeccionFinal;
        }

        let nombreFranela = `Franela ${coleccion.toUpperCase()} #${id}`;
        if (typeof nombresFranelas !== 'undefined' && nombresFranelas[coleccion]) {
            if (nombresFranelas[coleccion][id]) {
                nombreFranela = nombresFranelas[coleccion][id];
            }
        }

        if (titProd) titProd.innerText = nombreFranela;
        if (tituloPagina) tituloPagina.textContent = nombreFranela;

        const coleccionFormateadaTab = coleccion.charAt(0).toUpperCase() + coleccion.slice(1);
        document.title = `Nou | ${nombreFranela} — Colección ${coleccionFormateadaTab}`;

        if (precioProd) {
            let precioFinal = "$25.00";
            if (typeof preciosFranelas !== 'undefined' && preciosFranelas[coleccion] && preciosFranelas[coleccion][id]) {
                precioFinal = preciosFranelas[coleccion][id];
            }
            precioProd.innerText = precioFinal;
        }

        const gridContainer = document.getElementById('grid-relacionados');

        if (gridContainer && typeof nombresFranelas !== 'undefined' && nombresFranelas[coleccion]) {
            gridContainer.innerHTML = '';

            const franelasDeColeccion = nombresFranelas[coleccion];

            Object.keys(franelasDeColeccion).forEach(itemId => {
                const nombre = franelasDeColeccion[itemId];

                const tarjeta = document.createElement('div');
                tarjeta.className = 'producto-relacionado';

                tarjeta.onclick = function () {
                    window.location.href = `detalle.html?coleccion=${coleccion}&id=${itemId}`;
                };

                tarjeta.innerHTML = `
                    <img src="assets/${coleccion}/${itemId}.webp" alt="${nombre}">
                    <p>${nombre}</p>
                `;

                gridContainer.appendChild(tarjeta);
            });
        }

        if (typeof GLightbox !== 'undefined') {
            GLightbox({
                selector: '.glightbox',
                zoomable: true,
                draggable: true
            });
        }
    }
});

let colorDetalleActual = 'claro';

function cambiarColorDetalle(color) {
    colorDetalleActual = color;
    const botones = document.querySelectorAll('.info-producto .color-btn');
    botones.forEach(btn => {
        if (btn.textContent.toLowerCase() === color) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function cambiarCantidad(cambio) {
    const inputCantidad = document.getElementById('cantidad');
    if (!inputCantidad) return;

    let valorActual = parseInt(inputCantidad.value) || 1;
    let nuevoValor = valorActual + cambio;
    if (nuevoValor >= 1) {
        inputCantidad.value = nuevoValor;
    }
}

function agregarDesdeDetalle() {
    const urlParams = new URLSearchParams(window.location.search);
    const coleccion = urlParams.get('coleccion');
    const id = urlParams.get('id');

    if (!coleccion || id === null) return;

    let nombreFranela = `Franela ${coleccion.toUpperCase()} #${id}`;
    if (typeof nombresFranelas !== 'undefined' && nombresFranelas[coleccion] && nombresFranelas[coleccion][id]) {
        nombreFranela = nombresFranelas[coleccion][id];
    }

    const talla = document.getElementById('talla-detalle').value;
    const cantidad = document.getElementById('cantidad').value;
    const colorFormateado = colorDetalleActual.charAt(0).toUpperCase() + colorDetalleActual.slice(1);
    const precioTexto = document.getElementById('precio-producto') ? document.getElementById('precio-producto').innerText : '$25.00';

    const rutaImagenCatalogo = `assets/${coleccion}/${id}.webp`;

    const productoCatalogo = {
        id: "catalogo-" + coleccion + "-" + id + "-" + Date.now(),
        tipo: nombreFranela,
        coleccion: coleccion,
        color: colorFormateado,
        talla: talla,
        cantidad: parseInt(cantidad),
        precioTexto: precioTexto,
        miniatura: rutaImagenCatalogo
    };

    agregarAlCarrito(productoCatalogo);

    const boton = document.querySelector('.info-producto .btn-comprar');
    if (!boton) return;

    const textoOriginal = boton.innerHTML;
    boton.innerHTML = 'Agregando. Espere...';
    boton.classList.add('btn-exito');
    boton.disabled = true;

    setTimeout(() => {
        boton.innerHTML = textoOriginal;
        boton.classList.remove('btn-exito');
        boton.disabled = false;
    }, 2500);
}

/************* CAMBIAR COLECCION ACTIVA ********************/

const COLECCION_ACTIVA_ID = "bitacora";
const NOMBRE_COLECCION_ACTIVA = "Bitácora";

document.addEventListener("DOMContentLoaded", function () {
    const gridActivo = document.getElementById('grid-coleccion-activa');
    const tituloPrincipal = document.getElementById('titulo-coleccion-principal');
    const tituloPagina = document.getElementById('titulo-pagina-coleccion');

    if (gridActivo) {
        document.title = `Nou | Colección ${NOMBRE_COLECCION_ACTIVA}`;

        if (tituloPrincipal) tituloPrincipal.innerText = `Colección ${NOMBRE_COLECCION_ACTIVA}`;
        if (tituloPagina) tituloPagina.innerText = `Colección ${NOMBRE_COLECCION_ACTIVA}`;

        gridActivo.innerHTML = '';
        if (typeof nombresFranelas !== 'undefined' && nombresFranelas[COLECCION_ACTIVA_ID]) {
            const franelas = nombresFranelas[COLECCION_ACTIVA_ID];

            Object.keys(franelas).forEach(id => {
                const nombreFranela = franelas[id];

                const tarjeta = document.createElement('div');
                tarjeta.className = 'producto-coleccion-item';

                tarjeta.onclick = function () {
                    window.location.href = `detalle.html?coleccion=${COLECCION_ACTIVA_ID}&id=${id}`;
                };

                tarjeta.innerHTML = `
                    <img src="assets/${COLECCION_ACTIVA_ID}/${id}.webp" alt="${nombreFranela}">
                    <div>
                        <h3>${nombreFranela}</h3>
                        <button class="btn-ver-detalle">Ver detalle</button>
                    </div>
                `;

                gridActivo.appendChild(tarjeta);
            });
        }
    }
});

window.addEventListener('scroll', function () {
    const header = document.querySelector('.tope');
    if (!header) return;

    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const zorrito = document.querySelector('.zorrito-flotante');

    if (!zorrito) return;

    function mostrarMensajeAutomatico() {
        if (window.innerWidth <= 768) {
            zorrito.classList.add('mostrar-alerta');

            setTimeout(function () {
                zorrito.classList.remove('mostrar-alerta');
            }, 3000);
        }
    }

    setInterval(mostrarMensajeAutomatico, 180000);
    setTimeout(mostrarMensajeAutomatico, 5000);
});

function moverCarruselColecciones(direccion) {
    const galeria = document.querySelector('.galeria-productos');
    if (!galeria) return;

    const tarjeta = galeria.querySelector('.producto');
    if (!tarjeta) return;

    const anchoTarjeta = tarjeta.offsetWidth + 20;

    galeria.scrollBy({
        left: anchoTarjeta * direccion,
        behavior: 'smooth'
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const productos = document.querySelectorAll('.galeria-productos .producto');

    productos.forEach(producto => {
        const imagenes = producto.querySelectorAll('.imagenes-container img');

        if (imagenes.length > 1) {
            let intervalo = null;

            function iniciarAutoplayMovil() {
                if (window.innerWidth <= 768 && !intervalo) {
                    intervalo = setInterval(() => {
                        let indexActual = Array.from(imagenes).findIndex(img => img.classList.contains('activa'));
                        if (indexActual === -1) indexActual = 0;

                        imagenes[indexActual].classList.remove('activa');
                        let siguienteIndex = (indexActual + 1) % imagenes.length;
                        imagenes[siguienteIndex].classList.add('activa');
                    }, 3500);
                }
            }

            function detenerAutoplayEscritorio() {
                if (window.innerWidth > 768 && intervalo) {
                    clearInterval(intervalo);
                    intervalo = null;
                }
            }

            iniciarAutoplayMovil();

            window.addEventListener('resize', () => {
                if (window.innerWidth <= 768) {
                    iniciarAutoplayMovil();
                } else {
                    detenerAutoplayEscritorio();
                }
            });
        }
    });
});

function actualizarMedidasTalla() {
    const selectTalla = document.querySelector("#talla-detalle, #talla-franela");
    const infoMedidas = document.getElementById("info-medidas");

    if (!selectTalla || !infoMedidas) return;

    const tallaSeleccionada = selectTalla.value;

    if (guiaMedidas[tallaSeleccionada]) {
        const medida = guiaMedidas[tallaSeleccionada];
        infoMedidas.textContent = `Medidas: Ancho ${medida.ancho} | Largo ${medida.largo}`;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    actualizarMedidasTalla();
});


// Función para desplazar la vista al inicio de la sección en cualquier pantalla
function scrollToCustomizer() {
    const customSection = document.querySelector('#personalizadas');
    if (customSection) {
        customSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
}

const guiaMedidas = {
    "2": { ancho: "32 cm", largo: "42 cm" },
    "4": { ancho: "34 cm", largo: "45 cm" },
    "6": { ancho: "36 cm", largo: "48 cm" },
    "8": { ancho: "38 cm", largo: "51 cm" },
    "10": { ancho: "40 cm", largo: "54 cm" },
    "12": { ancho: "42 cm", largo: "57 cm" },
    "14": { ancho: "44 cm", largo: "60 cm" },
    "16": { ancho: "46 cm", largo: "63 cm" },
    "S": { ancho: "48 cm", largo: "68 cm" },
    "M": { ancho: "50 cm", largo: "70 cm" },
    "L": { ancho: "52 cm", largo: "72 cm" },
    "XL": { ancho: "54 cm", largo: "74 cm" }
};

const nombresFranelas = {
    "holamundo": {
        "0": "404",
        "1": "MINIMAL",
        "2": "VSCODE",
        "3": "PHP",
        "4": "ICODE",
        "5": "GIT",
        "6": "PYTHON"
    },
    "mjlegacy": {
        "0": "REMEMBER",
        "1": "GOLDEN",
        "2": "MUSIC",
        "3": "MOCASINES",
        "4": "THE KING",
    },
    "mandalorian": {
        "0": "GROGU",
        "1": "POPCORN",
        "2": "BABY",
        "3": "FATHER",
        "4": "BACKPACK",
        "5": "GROBW",
    },
    "chess": {
        "0": "CHECKMATE",
        "1": "CHESSBOARD",
        "2": "LAST DANCE",
        "3": "CHESSMASTER",
    },
    "seriefine": {
        "0": "HUELLA",
        "1": "LAVANDA",
        "2": "EUCALIPTO",
        "3": "COLA DE ZORRO",
        "4": "ORQUIDEA",
    },
    "soccer": {
        "0": "BRASIL",
        "1": "ARGENTINA",
        "2": "FRANCIA",
        "3": "ALEMANIA",
        "4": "PORTUGAL",
        "5": "ESPAÑA",
        "6": "LA FINAL",
        "7": "LA JUGADA",
        "8": "INGLATERRA",
    },
    "bitacora": {
        "0": "CUMBRES NEVADAS",
        "1": "VZLA",
        "2": "OTOÑO",
        "3": "ZARZAL",
    },
};

const preciosFranelas = {
    "holamundo": {
        "0": "$15.00 USD",
        "1": "$15.00 USD",
        "2": "$15.00 USD",
        "3": "$15.00 USD",
        "4": "$15.00 USD",
        "5": "$15.00 USD",
        "6": "$15.00 USD",
    },
    "mjlegacy": {
        "0": "$15.00 USD",
        "1": "$15.00 USD",
        "2": "$15.00 USD",
        "3": "$15.00 USD",
        "4": "$15.00 USD",
    },
    "mandalorian": {
        "0": "$15.00 USD",
        "1": "$15.00 USD",
        "2": "$15.00 USD",
        "3": "$15.00 USD",
        "4": "$15.00 USD",
        "5": "$15.00 USD",
    },
    "chess": {
        "0": "$25.00 USD",
        "1": "$25.00 USD",
        "2": "$25.00 USD",
        "3": "$25.00 USD",
    },
    "seriefine": {
        "0": "$15.00 USD",
        "1": "$15.00 USD",
        "2": "$15.00 USD",
        "3": "$15.00 USD",
        "4": "$15.00 USD",
    },
    "soccer": {
        "0": "$17.00 USD",
        "1": "$17.00 USD",
        "2": "$17.00 USD",
        "3": "$17.00 USD",
        "4": "$17.00 USD",
        "5": "$17.00 USD",
        "6": "$17.00 USD",
        "7": "$17.00 USD",
        "8": "$17.00 USD",
    },
    "bitacora": {
        "0": "$17.00 USD",
        "1": "$17.00 USD",
        "2": "$17.00 USD",
        "3": "$17.00 USD",
    },
};