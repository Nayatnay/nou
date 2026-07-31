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
    if (imgUsuario) dibujarEstampa();
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
}

function dibujarTodoConTamano(pos, tamano) {
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imgBase, 0, 0, canvas.width, canvas.height);

    if (imgUsuario) {
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
        carrito.forEach((item, i) => {
            lista.innerHTML += `
                <li>
                    <span>${item}</span>
                    <button onclick="eliminar(${i})" class="btn-eliminar" title="Eliminar producto">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </li>`;
        });
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
    window.open(`https://wa.me/584126067734?text=${encodeURIComponent("Hola, quiero pedir: " + carrito.join(", "))}`, '_blank');
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

// 1. Mostrar el nombre del archivo y habilitar/deshabilitar el botón dinámicamente
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

// 2. Función para procesar y agregar el diseño personalizado al carrito
function agregarPersonalizado() {
    const inputArchivo = document.getElementById('upload');
    const u = document.getElementById('ubicacion').value;
    const t = document.getElementById('tamano').value;
    const talla = document.getElementById('talla-franela').value;
    const boton = document.querySelector('.btn-comprar');

    const colorActualStr = typeof colorActual !== 'undefined' ? colorActual : 'blanco';
    const colorFormateado = colorActualStr.charAt(0).toUpperCase() + colorActualStr.slice(1);

    if (inputArchivo.files.length === 0) {
        alert('Por favor, selecciona un diseño para tu franela antes de continuar.');
        inputArchivo.click();
        return;
    }

    agregarAlCarrito(`Franela personalizada (Base en pantalla: ${colorFormateado} - *Consultar color exacto por WhatsApp*, Talla: ${talla}, Ubicación: ${u}, Tamaño: ${t})`);

    const textoOriginal = boton.innerHTML;
    boton.innerHTML = '¡Agregado al carrito! ✓';
    boton.classList.add('btn-exito');
    boton.disabled = true;

    setTimeout(() => {
        boton.innerHTML = textoOriginal;
        boton.classList.remove('btn-exito');

        if (inputArchivo.files.length > 0) {
            boton.disabled = false;
            boton.classList.remove('is-disabled');
        } else {
            boton.disabled = true;
            boton.classList.add('is-disabled');
        }
    }, 2500);
}

// 3. Asegurar que el botón inicie desactivado al cargar la página si no hay archivo
document.addEventListener("DOMContentLoaded", function () {
    const inputArchivo = document.getElementById('upload');
    const boton = document.querySelector('.btn-comprar');

    if (inputArchivo && inputArchivo.files.length === 0) {
        boton.disabled = true;
        boton.classList.add('is-disabled');
    }
});

renderizarCarrito();

// Lógica del menú móvil
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
    window.location.href = `detalle.html?coleccion=${coleccion}&id=${idImagen}`;
}

document.addEventListener("DOMContentLoaded", function () {
    const track = document.querySelector('.carousel-track');
    if (!track) return;

    const originalCards = Array.from(track.children);
    for (let i = 0; i < 2; i++) {
        originalCards.forEach(card => {
            track.appendChild(card.cloneNode(true));
        });
    }
});

// --- VARIABLES Y MAPA DE COLORES ---
let colorActual = 'blanco';

const mockups = {
    blanco: {
        frente: 'assets/mockup-base.png',
        espalda: 'assets/mockup-espalda.png'
    },
    negro: {
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
}

// --- FORMULARIOS AJAX (FORMSPREE) ---
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

// --- LÓGICA COMPLETA PARA LA PÁGINA DE DETALLES ---
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
        const tituloPagina = document.querySelector('.page-title'); // <- Nuevo: Seleccionamos el título de la página

        // 1. Cargar la imagen principal del producto (miniatura)
        if (imgProd) imgProd.src = `assets/grande/${coleccion}/${id}.webp`;

        // 1.1 Construimos y asignamos la URL dinámica para el href (Imagen grande)
        if (enlaceProducto) {
            enlaceProducto.href = `assets/grande/${coleccion}/${id}.webp`;
        }

        // 2. Mostrar el nombre de la colección junto a la imagen
        let textoColeccionFinal = "";
        if (spanColeccion) {
            const coleccionFormateada = coleccion.charAt(0).toUpperCase() + coleccion.slice(1);
            textoColeccionFinal = `Colección ${coleccionFormateada}`;
            spanColeccion.innerText = textoColeccionFinal;
        }

        // 3. Obtener el nombre real de la franela desde el diccionario
        let nombreFranela = `Franela ${coleccion.toUpperCase()} #${id}`;
        if (typeof nombresFranelas !== 'undefined' && nombresFranelas[coleccion] && nombresFranelas[coleccion][id]) {
            nombreFranela = nombresFranelas[coleccion][id];
        }

        // 4. Cargar el título principal en el HTML
        if (titProd) {
            titProd.innerText = nombreFranela;
        }

        // 4.1 NUEVO: Actualizar el <p class="page-title"> uniendo la colección y el título
        if (tituloPagina) {
            tituloPagina.textContent = `${nombreFranela}`;
        }

        // 5. Actualizar dinámicamente la pestaña del navegador (<title>)
        const coleccionFormateadaTab = coleccion.charAt(0).toUpperCase() + coleccion.slice(1);
        document.title = `Nou | ${nombreFranela} — Colección ${coleccionFormateadaTab}`;

        // 6. Cargar el precio correspondiente
        if (precioProd) {
            let precioFinal = "$25.00"; // Precio por defecto
            if (typeof preciosFranelas !== 'undefined' && preciosFranelas[coleccion] && preciosFranelas[coleccion][id]) {
                precioFinal = preciosFranelas[coleccion][id];
            }
            precioProd.innerText = precioFinal;
        }

        // 7. Generar el grid con las demás franelas de la misma colección (Relacionados)
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

        // 8. Inicializar Glightbox AQUÍ
        if (typeof GLightbox !== 'undefined') {
            GLightbox({
                selector: '.glightbox',
                zoomable: true,
                draggable: true
            });
        }
    }
});

let colorDetalleActual = 'blanco';

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

    // Obtener el precio que se muestra en pantalla
    const precioTexto = document.getElementById('precio-producto') ? document.getElementById('precio-producto').innerText : '';

    const productoFinal = `${cantidad}x ${nombreFranela} (${precioTexto} c/u) - [Base: ${colorFormateado} - *Consultar tono exacto por WhatsApp*, Talla: ${talla}]`;
    agregarAlCarrito(productoFinal);

    const boton = document.querySelector('.info-producto .btn-comprar');
    if (!boton) return;

    const textoOriginal = boton.innerHTML;
    boton.innerHTML = '¡Agregado al carrito!';
    boton.classList.add('btn-exito');
    boton.disabled = true;

    setTimeout(() => {
        boton.innerHTML = textoOriginal;
        boton.classList.remove('btn-exito');
        boton.disabled = false;
    }, 2500);
}

// --- COLECCIÓN ACTIVA ---
const COLECCION_ACTIVA_ID = "soccer";
const NOMBRE_COLECCION_ACTIVA = "Soccer";

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

//-------- tope transparente al hace scroll **********//

window.addEventListener('scroll', function () {
    const header = document.querySelector('.tope');

    // Si la posición en Y del scroll es mayor a 50 píxeles...
    if (window.scrollY > 50) {
        header.classList.add('scrolled'); // Agrega la clase de transparencia
    } else {
        header.classList.remove('scrolled'); // La quita si vuelve arriba
    }
});

/**** bocadillo mensaje del itopipo cada 60 segundos */

document.addEventListener("DOMContentLoaded", function () {
    const zorrito = document.querySelector('.zorrito-flotante');

    if (!zorrito) return;

    function mostrarMensajeAutomatico() {
        // Solo se ejecuta si la pantalla es menor o igual a 768px (móviles/tablets)
        if (window.innerWidth <= 768) {
            zorrito.classList.add('mostrar-alerta');

            // El mensaje se vuelve a ocultar automáticamente después de 3 segundos
            setTimeout(function () {
                zorrito.classList.remove('mostrar-alerta');
            }, 3000);
        }
    }

    // Configura el temporizador para que se repita cada 60 segundos (60000 milisegundos)
    setInterval(mostrarMensajeAutomatico, 60000);

    // (Opcional) Muestra el mensaje por primera vez a los 5 segundos de cargar la página
    setTimeout(mostrarMensajeAutomatico, 5000);
});


/***************************** D I C C I O N A R I O S ************************/
// Diccionario con los nombres reales de cada franela por colección y número/archivo
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
};

// Diccionario de precios (opcional: si deseas colocar precios específicos por pieza)
const preciosFranelas = {
    "holamundo": {
        "0": "$12.00 USD",
        "1": "$12.00 USD",
        "2": "$12.00 USD",
        "3": "$12.00 USD",
        "4": "$12.00 USD",
        "5": "$12.00 USD",
        "6": "$12.00 USD",
    },
    "mjlegacy": {
        "0": "$16.00 USD",
        "1": "$16.00 USD",
        "2": "$16.00 USD",
        "3": "$16.00 USD",
        "4": "$16.00 USD",
    },
    "mandalorian": {
        "0": "$25.00 USD",
        "1": "$25.00 USD",
        "2": "$28.00 USD",
        "3": "$30.00 USD",
        "4": "$15.00 USD",
        "5": "$20.00 USD",
    },
    "chess": {
        "0": "$25.00 USD",
        "1": "$25.00 USD",
        "2": "$28.00 USD",
        "3": "$30.00 USD",
    },
    "seriefine": {
        "0": "$15.00 USD",
        "1": "$15.00 USD",
        "2": "$15.00 USD",
        "3": "$15.00 USD",
        "4": "$15.00 USD",
    },
    "soccer": {
        "0": "$20.00 USD",
        "1": "$20.00 USD",
        "2": "$20.00 USD",
        "3": "$20.00 USD",
        "4": "$20.00 USD",
        "5": "$20.00 USD",
        "6": "$20.00 USD",
        "7": "$20.00 USD",
        "8": "$20.00 USD",
    },
};