L.mapbox.accessToken = 'pk.eyJ1IjoiaWtrb2IiLCJhIjoiY2twMmY3b3prMWpvYjJvbXczdzk0OHF1ZSJ9.6j0RtV05VwqttLIR0RfWJg';
var map = L.mapbox.map('map')
    .setView([37.8, -96], 4)
    .addLayer(L.mapbox.styleLayer('mapbox://styles/mapbox/streets-v11'));

// control position
map.zoomControl.setPosition('bottomleft');



var getDataJson = async function () {
    const url = 'https://raw.githubusercontent.com/lulumalik/choropleth/master/public/us.json';
    const res = await fetch(url);
    const data = await res.json();
    // console.log(data);

    L.geoJson(data, {
        style: getStyle,
        onEachFeature: onEachFeature
    }).addTo(map);

}

getDataJson();

function getStyle(feature) {
    return {
        weight: 2,
        opacity: 0.2,
        color: 'black',
        fillOpacity: 0.7,
        fillColor: getColor(feature.properties.density)
    };
}

// dens for density
function getColor(dens) {
    return dens > 1000 ? '#005E36' :
        dens > 500 ? '#008256' :
            dens > 200 ? '#329E70' :
                dens > 100 ? '#52BA8A' :
                    dens > 50 ? '#70D8A6' :
                        dens > 20 ? '#77DFAD' :
                            dens > 10 ? '#8DF6C2' :
                                '#A5FFD9';
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: openDetail,
        mouseout: removeMark
    });
}


function openDetail(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 3,
        opacity: 0.3,
        //         fillOpacity: 0.9
    });


    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }


    openCard(layer.feature.properties);
    // info.update(layer.feature.properties);
}

function openCard(property) {
    const info = document.createElement('div');
    info.classList.add('info');
    info.innerHTML = '<h4>US Population Density</h4>' + (property ?
        '<b>' + property.name + '</b><br />' + property.density + ' people / mi<sup>2</sup>'
        : '');
    document.body.appendChild(info);
}


//remove mark style
function removeMark(e) {
    let lay = e.target;

    lay.setStyle({
        weight: 2,
        opacity: 0.2,
        color: 'black',
        fillOpacity: 0.7
    });

    removeCard();
}

function removeCard() {
    const info = document.querySelector('.info');
    info.remove();
}

//Layer Control
L.control.layers({
    'Streets': L.mapbox.styleLayer('mapbox://styles/mapbox/streets-v11'),
    'Light': L.mapbox.styleLayer('mapbox://styles/mapbox/light-v10'),
    'Outdoors': L.mapbox.styleLayer('mapbox://styles/mapbox/outdoors-v11')
}).addTo(map);




// search box
const searchInput = document.getElementById('search');
const closeBtn = document.querySelector('.fa-times');
const serach_API = 'https://api.openrouteservice.org/geocode/search?api_key=5b3ce3597851110001cf6248689a30945e9841c285692e8387d3e58e&text=';

//get data
async function getTextData(loc) {
    const res = await fetch(loc);
    const data = await res.json();

    showListLocation(data.features);
}

function showListLocation(links) {
    let searchLinks = document.querySelector('.search-links');
    searchLinks.innerHTML = '';
    links.forEach((link) => {
        const linkEl = document.createElement('div');
        linkEl.classList.add('link');
        linkEl.innerHTML = `
        <p>${link.properties.name}, ${link.properties.country}</p>
        <small class="par">${link.properties.county}, ${link.properties.region}, ${link.properties.country}</small>
        <small class="hidden">${link.geometry.coordinates}</small>
        `;

        searchLinks.appendChild(linkEl);
    });


    // Create Marker
    const linkTobe = document.querySelectorAll('.link');
    linkTobe.forEach(linkT => {
        linkT.addEventListener('click', (e) => {
            removeListLocation();
            let elements = e.target;
            let textPop = elements.querySelector('.par').textContent;
            let value = elements.querySelector('.hidden').textContent.split(",");
            let latLang = value.reverse();
            addMarker(latLang, textPop);
        });
    });

    function addMarker(coor, text) {
        var redMarker = {};
        map.setView(coor, 9);
        redMarker = L.marker(coor).bindPopup(`<h2 style="text-align: center">${text}`).openPopup().addTo(map);
    }

    function removeListLocation() {
        searchLinks.innerHTML = '';
        searchInput.value = '';
    }


    // const closeBtn = document.querySelector('.fa-times');
    // closeBtn.style.display = 'block';

    // closeBtn.addEventListener('click', () => {
    //     let searchLinks = document.querySelector('.search-links');
    //     searchLinks.remove();
    // });

}

searchInput.addEventListener('keydown', (e) => {
    const location = e.target.value;

    if (location !== '' && location.length > 4) {
        getTextData(serach_API + location);
    }
    document.body.onclick = () => {
        if (location) {
            let searchLinks = document.querySelector('.search-links');
            searchLinks.innerHTML = '';
            searchInput.value = '';
        }
    }
});

