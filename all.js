//map default location
var map = L.map('map').setView([25.0467715,121.5141576], 10);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

//make icon and show stock by color
var maskIcon;
const greenIcon=new L.Icon({
    iconUrl: './img/green-icon.png',
    iconSize: [40, 55],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});
const redIcon=new L.Icon({
    iconUrl: './img/red-icon.png',
    iconSize: [40, 55],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});
const greyIcon=new L.Icon({
    iconUrl: './img/grey-icon.png',
    iconSize: [40, 55],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});

//use markercluster
const markers = new L.MarkerClusterGroup({ disableClusteringAtZoom: 18 }).addTo(map);
//set icon to map
function addMarker(){
	data.forEach(function(item){
		let shopName = item.properties.name;
		let addr=item.properties.address;
		let tel=item.properties.phone;
		let maskAdult = item.properties.mask_adult;
		let maskChild = item.properties.mask_child;
		let lat =item.geometry.coordinates[1];
		let lng =item.geometry.coordinates[0];
		if(maskAdult==0 && maskChild==0){
			maskIcon=greyIcon;
		}else if(maskAdult<=100 && maskChild<=100){
			maskIcon=redIcon;
		}else{
			maskIcon=greenIcon;
		}
		let str=`<div class="popup-item">
		<h3 class="popup-title">${shopName}</h3>
		<p class="popup-info address">${addr}</p>
		<p class="popup-info tel">${tel}</p>
		<div class="mask-inventory">
			<div class="pills pill-${inventory(maskAdult)}">
				<p>成人</p>
				<p class="quantity">${maskAdult}</p>
			</div>
			<div class="pills pill-${inventory(maskChild)}">
				<p>兒童</p>
				<p class="quantity">${maskChild}</p>
			</div>
		</div>
	</div>`
		markers.addLayer(L.marker([lat,lng], {icon: maskIcon}).bindPopup(str));	
	})
	map.addLayer(markers);
}

/* -----------custom function----------- */
var data;
var cityShopData=[];
var cityList=[];
var distShopData=[];
var distList=[];
var toggleBtn=document.querySelector(".toggle-btn");
var shopListNode=document.querySelector(".shop-list");

document.querySelector(".city-list").addEventListener("change",getDistList);
document.querySelector(".dist-list").addEventListener("change",getDistShop);
document.querySelector(".toggle-btn").addEventListener("click",menuToggle);



//init
function init(){
	setDate();
	getData();
}
//menu open toggle
function menuToggle(){
	let menu=document.querySelector(".main-menu");
	menu.classList.toggle("menu-toggle");
}
//render date and ID check
function setDate(){
	let dateObj=new Date();
	let day=dateObj.getDay();
	let date=dateObj.getDate();
	let month=dateObj.getMonth();
	let year=dateObj.getFullYear();
	let dayNameZh=["星期日","星期一","星期二","星期三","星期四","星期五","星期六"];
	let regularId="";
	switch(day){
		case 0:
			regularId="0~9";
			break;
		case 1:
		case 3:
		case 5:
			regularId="1,3,5,7,9";
			break;
		case 2:
		case 4:
		case 6:
			regularId="0,2,4,6,8";
			break;
	}
	document.querySelector(".current-week").innerHTML=dayNameZh[day];
	document.querySelector(".current-date").innerHTML=`${year}-${month+1}-${date}`;
	document.querySelector(".id-highlight").innerHTML=regularId;

}
//get shop list
function getData(){
    const xhr = new XMLHttpRequest;
    xhr.open('get','https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json',true)
    xhr.send(null);
    xhr.onload = function(){
		data = JSON.parse(xhr.responseText).features;
		addMarker();
		getCityList();
		removeLoading();
    }
}
function removeLoading(){
	let body=document.querySelector("body");
	let loadingBox=document.querySelector(".loading");
	body.removeChild(loadingBox);
}

//get city list
function getCityList(){
	data.forEach(function(item){
		if(item.properties.county&&cityList.indexOf(item.properties.county)==-1){
			cityList.push(item.properties.county)
		}
	})
	//set city option by innerHTML
	let cityOption="<option disabled selected>請選擇縣市</option>";
	cityList.forEach(function(item){
		cityOption+=`<option value="${item}">${item}</option>`;
	})
	document.querySelector(".city-list").innerHTML=cityOption;
}
//set district list and filter
function getDistList(e){
	let selectedCity=e.target.value;
	cityShopData=[];
	distList=[];
	data.forEach(function(item){
		if(item.properties.county==selectedCity){
			cityShopData.push(item);
		}
	})
	cityShopData.forEach(function(item){
		if(distList.indexOf(item.properties.town)==-1){
			distList.push(item.properties.town)
		}
	})
	//set district option by innerHTML
	let distOption="<option disabled selected>請選擇區域</option>";
	distList.forEach(function(item){
		distOption+=`<option value="${item}">${item}</option>`
	})
	listRender(cityShopData);
	document.querySelector(".dist-list").innerHTML=distOption;
}
function getDistShop(e){
	let selectedDist=e.target.value;
	distShopData=[];
	cityShopData.forEach(function(item){
		if(item.properties.town==selectedDist){
			distShopData.push(item)
		}
	})
	listRender(distShopData);
}
//change pill color by inventory
function inventory(e){
	if(e==0){
		return "grey";
	}else if(e<=100){
		return "red";
	}else{
		return "green";
	}
}
//set list element to html
function listRender(item){
	let shopStr="";
	for(i=0;i<item.length;i++){
		let shopName=item[i].properties.name;
		let addr=item[i].properties.address;
		let tel=item[i].properties.phone;
		let openTime=item[i].properties.note;
		let maskAdult=item[i].properties.mask_adult;
		let maskChild=item[i].properties.mask_child;
		let shopLat=item[i].geometry.coordinates[1];
		let shopLng=item[i].geometry.coordinates[0];
		shopStr+=`
		<li class="shop-item">
				<div class="location-btn" data-lat="${shopLat}" data-lng="${shopLng}"></div>
				<h3 class="shop-title">${shopName}</h3>
				<p class="shop-info address">${addr}</p>
				<p class="shop-info tel">${tel}</p>
				<p class="shop-info open-time">備註${openTime}</p>
				<div class="mask-inventory">
					<div class="pills pill-${inventory(maskAdult)}">
						<p>成人口罩</p>
						<p class="quantity">${maskAdult}</p>
					</div>
					<div class="pills pill-${inventory(maskChild)}">
						<p>兒童口罩</p>
						<p class="quantity">${maskChild}</p>
					</div>
				</div>
			</li>`
	}
	shopListNode.innerHTML=shopStr;
	//jusp to selected district
	let lat=item[0].geometry.coordinates[1];
	let lng=item[0].geometry.coordinates[0];
	map.setView([lat,lng], 15);
	//add click event to item
	let jumpBtn=document.querySelectorAll(".location-btn");
	jumpToShop(jumpBtn);
}
function jumpToShop(jumpBtn){
	for(i=0;i<jumpBtn.length;i++){
		jumpBtn[i].addEventListener("click",function(e){
			let lat=e.target.dataset.lat;
			let lng=e.target.dataset.lng;
			map.setView([lat,lng], 20);
			markers.eachLayer(function (layer) {
                // 宣告變數，並使用 getLatLng 的方法，取得 layer（marker） 的經緯
                const layerLatLng = layer.getLatLng();
                    // 用判斷式比對經緯度，如果 layer（marker）的經緯度與點擊目標的經
                    if (layerLatLng.lat == lat && layerLatLng.lng == lng) {
                        layer.openPopup();
					}
				})
				menuToggle();
		})
	}
	
}









init();


// function showNum(e){
// 	let num;
// 	if(e.target.nodeName=="LI"){
// 		num=e.target.dataset.num;
// 	}else if(e.target.parentNode.nodeName=="LI"){
// 		num=e.target.parentNode.dataset.num
// 	}else{
// 		return;
// 	}
// 	console.log(num)
// }
