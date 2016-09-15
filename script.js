var options = { 
	valueNames: [ 'datotid', 'varenummer', 'varetype', 'varenavn','pris', 'f_pris', 'diff', 'volum' ], 
	page: 14, 
	plugins: [ ListPagination({}) ]
 };

function loadInfo() {
	$.getJSON("/api/vin", function(data) {
		var div = document.getElementById("dbinfo");
		var txt = '<small>Sist oppdatert: '+data.data[0]["Datotid"]+' <span class=badge>'+data.data[0]["antall"]+'</span> varer med <em>'+data.data[0]["historikk"]+'</em> prisjusteringer</small>';
		div.innerHTML = txt;
	});
}

function loadTypes() {

	$.getJSON("/api/vin/products/types", function(data) {
		var div = document.getElementById("varetyper");

		var txt = '<select class="form-control" onchange="loadProductsByType()" placeholder="Varetype" id=selvaretype ><option value=null></option selected><option value="Alle varetyper">Alle varetyper</option>';
		data.data.forEach(function(row) {
			txt += "<option value=\""+row.Varetype+"\">"+row.Varetype+" ("+row.antall+")</option>";		
		});
		txt += '</select>';

		div.innerHTML=txt;
	});
}


function loadDetails(varenummer) {

    var dialog = document.querySelector('dialog');
    dialog.showModal();
    dialog.querySelector('.close').addEventListener('click', function() {
      dialog.close();
    });

	var div = document.getElementById("details");
	var txt = "";

	$.getJSON("/api/vin/product/"+varenummer, function(data) {
		txt += "<div class='mdl-grid'>";
		txt += "<div class='mdl-cell--col-6'>";
		txt += "<dl class='dl-horizontal'>";
		txt += "<dt>Varenavn</dt><dd>"+data.data.Varenavn+"</dd>";
		txt += "<dt>Varetype</dt><dd>"+data.data.Varetype+", "+data.data.Rastoff+", "+data.data.Alkohol+"% ABV</dd>";
		txt += "<dt>Pris</dt><dd>"+data.data.Pris+" kr ("+data.data.Volum+"l) "+data.data.Produktutvalg+" "+data.data.Butikkategori+"</dd>";
		txt += "<dt>Fra</dt><dd>"+data.data.Produsent+", "+data.data.Land+", "+data.data.Distrikt+", "+data.data.Underdistrikt+"</dd>";
		txt += "<dt>Beskrivelse</dt><dd>"+data.data.Farge+" "+data.data.Lukt+" "+data.data.Smak+"</dd>";
		txt += "<dt>Lagring</dt><dd>Årgang: "+data.data.Argang+" "+data.data.Lagringsgrad+" "+data.data.Emballasjetype+" "+data.data.Korktype+"</dd>";
		txt += "</dl>";

		txt += "</div></div>";
		txt += "<div class='mdl-cell--hide-phone' id=priceChart>";
		txt += "<img class='mdl-cell--hide-phone' src=https://bilder.vinmonopolet.no/cache/300x300-0/"+data.data.Varenummer+"-1.jpg>";
		txt += "</div>";
		div.innerHTML = txt;

		$.getJSON("/api/vin/product/"+varenummer+"/price", function(data) {
			var p = "<dl class='dl-horizontal'>";

			var chart = { datoer: [ ], priser: [ ] };
	
			data.data.forEach(function(r) {
				p += "<dt>"+r.Datotid+"</dt><dd>"+r.Pris+"</dd>";
				chart.datoer.push(r.Datotid);
				chart.priser.push(parseInt(r.Pris));
			});			

			p += "</dl>"

//			price.innerHTML = p;

			$("#priceChart").highcharts({
				chart: { type: 'spline', width: 800, height: 200 },
				plotOptions: { spline: { dataLabels: { enabled: true }, enableMouseTracking: false } },
				title: { text: 'Prishistorikk' },
				xAxis: { categories: chart.datoer },
				yAxis: { title: { text: 'NOK' } },
				series: [ { name: 'Pris', data: chart.priser, step: 'right' } ]
			});


		});

	});
}


function loadPriceChanges() {
	document.getElementById("products").innerHTML='<div id="p2" class="mdl-progress mdl-js-progress mdl-progress__indeterminate"></div>';
	var url = "/api/vin/pricechanges";
	$.getJSON(url, function(data) {
		var txt = 
//					"<table class='table table-responsive table-striped table-hover table-condensed'><thead><tr>"+
					"<table class='mdl-data-table mdl-js-data-table mdl-data-table--selectable mdl-shadow--2dp'><thead><tr>"+
//					"<th class='mdl-data-table__cell--non-numeric'><span class='mdl-data-table__cell--non-numeric sort' data-sort=varenummer>Varenr.</span></th>"+
//					"<th class=mdl-data-table__cell--non-numeric><span class='mdl-data-table__cell--non-numeric sort' data-sort=varetype>Type</span></th>"+
					"<th class=mdl-data-table__cell--non-numeric><span class='mdl-data-table__cell--non-numeric sort' data-sort=varenavn>Navn</span></th>"+
//					"<th class=mdl-data-table__cell--non-numeric><span class='mdl-data-table__cell--non-numeric sort' data-sort=datotid>Endret</span></th>"+
					"<th><span class='sort' data-sort=pris>Pris</span></th>"+
//					"<th><span class='sort' data-sort=f_pris>Før</span></th>"+
//					"<th><span class=sort data-sort=diff>Diff</span></th>"+
//					"<th><span class=sort data-sort=volum>Vol</span></th>"+
					"</tr></thead><tbody class=list>";
		var div = document.getElementById("products");
		data.data.forEach(function(row) {
			var diffClass = "diff";
			var diff = row.diff; //Math.floor(row.pris-row.f_pris);
			if (diff < -10) diffClass="diff bg-success";
			if (diff > 10) diffClass="diff bg-danger";
			
			var butikk = "";
			if (
				row.Butikkategori == "Butikkategori 1" ||
				row.Butikkategori == "Butikkategori 2" ||
				row.Butikkategori == "Butikkategori 3" ||
				row.Butikkategori == "Butikkategori 4" ||
				row.Butikkategori == "Butikkategori 5" ||
				row.Butikkategori == "Butikkategori 6")
				butikk="<b>*</b>";

			txt += 	"<tr>"+
//					"<td class=varenummer><a href="+row.Vareurl+" target=_blank>"+row.Varenummer+"</a>"+butikk+
//					"</td><td class='mdl-data-table__cell--non-numeric varetype'>"+row.Varetype+
					"</td><td class='mdl-data-table__cell--non-numeric varenavn' onclick='loadDetails("+row.Varenummer+")'>"+row.Varetype+
						" <small>"+row.f_dato+"</small><br>"+row.Varenavn+
//					"</td><td class='mdl-data-table__cell--non-numeric datotid'>"+row.f_dato+
					"</td><td class=pris title='"+row.f_dato+": "+row.f_pris+" ("+row.Volum+"l)'><em>"+row.pris+"</em><br><small><span class="+diffClass+">"+row.diff+
//					"</td><td class='f_pris small'>"+row.f_pris+
//					"</td><td class=\""+diffClass+"\">"+row.diff+
//					"</td><td class=volum>"+row.Volum+
					"</td></tr>";
		});
		txt += "</tbody></table><ul class=pagination></ul>";
		div.innerHTML = txt;	
		var products = new List('vinliste', options);
	});
}

function loadProductsByType() {

	document.getElementById("products").innerHTML='<div class="mdl-progress mdl-js-progress mdl-progress__indeterminate"></div>';
	componentHandler.upgradeDom();
	var sel = document.getElementById("selvaretype").value;

	var url;
	if (sel != "Alle varetyper")
		url = "/api/vin/products/"+sel;
	else {
		url = "/api/vin/products";
	}
	$.getJSON(url, function(data) {
		var txt = 
					"<table class='table table-responsive table-striped table-hover table-condensed'><thead><tr>"+
					"<th><span class=sort data-sort=varenummer>Varenr.</span></th>"+
//					"<th><span class=sort data-sort=varetype>Type</span></th>"+
					"<th><span class=sort data-sort=varenavn>Navn</span></th>"+
					"<th><span class=sort data-sort=datotid>Dato</span></th>"+
					"<th><span class=sort data-sort=pris>Pris</span></th>"+
//					"<th><span class=sort data-sort=f_pris>Før</span></th>"+
					"<th><span class=sort data-sort=diff>Diff</span></th>"+
//					"<th><span class=sort data-sort=volum>Vol</span></th>"+
					"</tr></thead><tbody class=list>";
		var div = document.getElementById("products");
		data.data.forEach(function(row) {
			var diffClass = "diff";
			var diff = row.diff; //Math.floor(row.pris-row.f_pris);
			if (diff < -10) diffClass="diff bg-success";
			if (diff > 10) diffClass="diff bg-danger";
			
			var butikk = "";
			if (
				row.Butikkategori == "Butikkategori 1" ||
				row.Butikkategori == "Butikkategori 2" ||
				row.Butikkategori == "Butikkategori 3" ||
				row.Butikkategori == "Butikkategori 4" ||
				row.Butikkategori == "Butikkategori 5" ||
				row.Butikkategori == "Butikkategori 6")
				butikk="<b>*</b>";

			txt += 	"<tr><td class=varenummer><a href="+row.Vareurl+" target=_blank>"+row.Varenummer+"</a>"+butikk+
//					"</td><td class=varetype>"+row.Varetype+
					"</td><td class=varenavn onclick='loadDetails("+row.Varenummer+")'>"+row.Varenavn+
					"</td><td class=datotid>"+row.Datotid+
					"</td><td class=pris title='"+row.f_dato+": "+row.f_pris+" ("+row.Volum+"l)'>"+row.pris+
//					"</td><td class=f_pris>"+row.f_pris+
					"</td><td class=\""+diffClass+"\">"+row.diff+
//					"</td><td class=volum>"+row.Volum+
					"</td></tr>";
		});
		txt += "</tbody></table><ul class=pagination></ul>";
		div.innerHTML = txt;	
		var products = new List('vinliste', options);
	});
}
