function insertData(a, b, c = "") {
    let table = document.getElementsByClassName("markdown-table")[0];
    let newRow = table.insertRow();
    newRow.className = "data-row"; // 添加类名

    let cells = [
        newRow.insertCell(),
        newRow.insertCell(),
        newRow.insertCell()
    ];

    cells[0].className = "key-cell";
    cells[1].className = "value-cell";
    cells[2].className = "extra-cell";

    cells[0].innerHTML = a;
    cells[1].innerHTML = b;
    cells[2].innerHTML = c;
}

async function mod_spawn() {
    let tran_dict = [AddTran, DefaultTran, VanillaTran, PowTran]
    let p_dic = get_p(window.location.href);
    let item_id = p_dic['item'];
    let item_dict = window.AddData[item_id]
    let resp = await fetch('static/data/items/' + window.AddData[item_id]['file_path'])
    let item_beh = await resp.json()
    item_dict['beh'] = item_beh
    let lang = p_dic['lang']
    let components = item_dict['beh']['minecraft:item']['components']
    let custom_tag = []
    Object.keys(components).forEach((t) => {
        if (t.indexOf('tag:') != -1) {
            custom_tag.push(t)
        }
    })
    custom_tag.forEach(t => {
        let tag_data = []
        let cache_data = ''
        for (let l of t) {
            if (l == ':') {
                tag_data.push(cache_data)
                cache_data = ''
            } else {
                cache_data += l
            }
        }
        if (cache_data != '') {
            tag_data.push(cache_data)
        }
        console.log(tag_data)
        if (tag_data[1] == 'comp'){
            if(tag_data[2]=='armor_resilience'){
                insertData(translate(lang,tran_dict,'text.pow:armor_resilience.name'), String(tag_data[3]));
            }
            if(tag_data[2]=='armor_physical_protection'){
                insertData(translate(lang,tran_dict,'text.pow:armor_physical_protection.name'), String(tag_data[3]));
            }
            if(tag_data[2]=='armor_physical_reduction'){
                insertData(translate(lang,tran_dict,'text.pow:armor_physical_reduction.name'), String(tag_data[3]));
            }
            if(tag_data[2]=='armor_magic_protection'){
                insertData(translate(lang,tran_dict,'text.pow:armor_magic_protection.name'), String(tag_data[3]));
            }
            if(tag_data[2]=='armor_magic_reduction'){
                insertData(translate(lang,tran_dict,'text.pow:armor_magic_reduction.name'), String(tag_data[3]));
            }
            if(tag_data[2]=='movement_addition'){
                let d_str = String(tag_data[3])
                if (tag_data[3] > 0){
                    d_str = '+' + tag_data[3]
                }
                insertData(translate(lang,tran_dict,'text.pow:movement_addition.name'), d_str);
            }
            if(tag_data[2]=='sneak_movement_addition'){
                let d_str = String(tag_data[3])
                if (tag_data[3] > 0){
                    d_str = '+' + tag_data[3]
                }
                insertData(translate(lang,tran_dict,'text.pow:sneak_movement_addition.name'), d_str);
            }
            if(tag_data[2]=='equipment_type'){
                insertData(translate(lang,tran_dict,'text.pow:equipment_type.name'), String(tag_data[3]));
            }
            if(tag_data[2]=='actual_level'){
                insertData(translate(lang,tran_dict,'text.pow:actual_level.name'), String(tag_data[3]));
            }
        }
    })
}

window.onload = mod_spawn()