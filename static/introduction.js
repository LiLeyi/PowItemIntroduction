async function items_li_spawn() {
    let tran_dict = [AddTran, DefaultTran, VanillaTran]
    let p_dic = get_p(window.location.href);
    let item_id = p_dic['item'];
    let item_dict = window.AddData[item_id]
    let resp = await fetch('static/data/items/' + window.AddData[item_id]['file_path'])
    let item_beh = await resp.json()
    item_dict['beh'] = item_beh
    let lang = p_dic['lang']
    //标题
    let page_title = window.AddName + translate(lang, tran_dict, 'text.dec:title.name');
    document.title = page_title;

    let name_lang_obj = document.getElementById('js_item_name_lang');
    let name = undefined
    if (item_dict['lang'][lang] == undefined) {
        name = item_dict['beh']['components']['minecraft:display_name']['value']
    } else {
        name = item_dict['lang'][lang]
    }

    // 修改insertData函数以支持更好的表格样式
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

    // 在fill_blank函数中添加样式类
    function fill_blank(blank_div, content, judge = "") {
        if (judge.length != 0) {
            blank_div.innerHTML = content;
        } else {
            blank_div.innerHTML = null;
        }
    }

    function fill_loot_blank(blank_div, content, probability) {
        if (content) {
            const sourceElem = blank_div.querySelector('.loot-source');
            const probElem = blank_div.querySelector('.loot-probability');

            sourceElem.textContent = content;
            probElem.textContent = probability ? `${probability}` : '?';

            // 根据概率值调整颜色
            const probValue = parseFloat(probability) || 0;
            probElem.style.background =
                probValue > 4 ? '#27ae60' :
                    probValue > 2 ? '#f1c40f' :
                        '#e74c3c';
        } else {
            blank_div.style.display = 'none';
        }
    }

    name_lang_obj.innerHTML = name + '<span class="item-subtitle">(' + item_dict['lang']['en_US'] + ')</span>';

    insertData("物品ID", item_id);

    document.getElementById('js_item_basic').innerHTML = translate(lang, tran_dict, 'text.dec:title_basic.name')


    if (item_dict['loot'].length != 0) {
        item_dict['loot_by_entity_lang'][lang] = [];

        for (let l of item_dict['loot']) {
            let name = l.split("/").at(-1).split(".")[0];

            if ("entity.dec:" + name + ".name" in AddTran[lang]) {
                item_dict['loot_by_entity_lang'][lang].push(AddTran[lang]['entity.dec:' + name + '.name']);
            }
            if ("entity.wb:" + name + ".name" in AddTran[lang]) {
                item_dict['loot_by_entity_lang'][lang].push(AddTran[lang]['entity.wb:' + name + '.name']);
            }
            if ("entity.epic:" + name + ".name" in AddTran[lang]) {
                item_dict['loot_by_entity_lang'][lang].push(AddTran[lang]['entity.epic:' + name + '.name']);
            }
        }

        if (item_dict['loot_by_entity_lang'][lang] != undefined) {
            fill_loot_blank(document.getElementById('js_item_loot_by_entity'), String(item_dict['loot_by_entity_lang'][lang]), item_dict['loot_by_entity_lang'][lang].length);
        } else {
            document.getElementById('js_item_loot_by_entity').style.display = 'none';
        }

        item_dict['loot_by_block_lang'][lang] = [];

        for (let l of item_dict['loot']) {
            let name = l.split("/").at(-1).split(".")[0];

            if ("tile.dec:" + name + ".name" in AddTran[lang]) {
                item_dict['loot_by_block_lang'][lang].push(AddTran[lang]['tile.dec:' + name + '.name']);
            }
            if ("tile.wb:" + name + ".name" in AddTran[lang]) {
                item_dict['loot_by_block_lang'][lang].push(AddTran[lang]['tile.wb:' + name + '.name']);
            }
            if ("tile.epic:" + name + ".name" in AddTran[lang]) {
                item_dict['loot_by_block_lang'][lang].push(AddTran[lang]['tile.epic:' + name + '.name']);
            }
        }

        if (item_dict['loot_by_block_lang'][lang] != undefined) {
            fill_loot_blank(document.getElementById('js_item_loot_by_block'), String(item_dict['loot_by_block_lang'][lang]), item_dict['loot_by_block_lang'][lang].length)
        } else {
            document.getElementById('js_item_loot_by_block').style.display = 'none';
        }

        let otherArr = [];
        if(item_dict['loot'].findIndex(e => e.indexOf('loot_tables/tasks/') != -1) != -1){
            otherArr.push("任务");
        }
        if(item_dict['loot'].findIndex(e => e.indexOf('loot_tables/chests/') != -1) != -1){
            otherArr.push("建筑遗迹箱子");
        }
        if(otherArr.length != 0){
            fill_loot_blank(document.getElementById('js_item_loot_by_other'), otherArr.join(", "), otherArr.length);
        }else{
            document.getElementById('js_item_loot_by_other').style.display = 'none';
        }

        for (let l of item_dict['loot']) {
            if (l.indexOf('loot_tables/gameplay/advancements/') != -1) {
                let loot_special = translate(lang, tran_dict, 'text.dec:loot_by_advancements.name')
                fill_loot_blank(document.getElementById('js_item_loot_by_fishing'), loot_special, loot_special.length)
                break
            } else {
                document.getElementById('js_item_loot_by_fishing').style.display = 'none';
            }
        }


        console.log(item_dict);
        if (JSON.stringify(item_dict['loot_by_structure']) != '{}') {
            let loot_structure = '';
            for (let k in item_dict['loot_by_structure']) {
                let add_l = k + translate(lang, tran_dict, 'text.dec:loot_by_structure_dot1.name')
                for (let v of item_dict['loot_by_structure'][k]) {
                    add_l += translate(lang, tran_dict, v) + translate(lang, tran_dict, 'text.dec:loot_by_structure_dot2.name')
                }
                add_l = add_l.slice(0, add_l.length - 1)
                add_l = add_l + translate(lang, tran_dict, 'text.dec:loot_by_structure_dot3.name')
                loot_structure += add_l
            }
            loot_structure = loot_structure.slice(0, loot_structure.length - 1);
            fill_loot_blank(document.getElementById('js_item_loot_by_structure'), loot_structure);
        } else {
            document.getElementById('js_item_loot_by_structure').style.display = 'none';
        }
    } else {
        document.getElementsByClassName('loot-section')[0].style.display = 'none';
    }
    let components = item_dict['beh']['minecraft:item']['components']
    if (components.hasOwnProperty('minecraft:damage')) {
        insertData("基础攻击", String(components['minecraft:damage']));
    }
    if (components.hasOwnProperty('minecraft:durability')) {
        insertData("耐久值", String(components['minecraft:durability']['max_durability']));
    }
    if (item_dict['rec'].length != 0) {
        let recs = ''
        for (let rec of item_dict['rec']) {
            recs += rec_spawn(rec, tran_dict, lang, true)
        }
        fill_blank(document.getElementById('js_item_if_rec'), recs, '1')
    } else {
        fill_blank(document.getElementById('js_item_if_rec'), translate(lang, tran_dict, 'text.dec:recipe_no.name'), '1')
    }
    if (item_dict['ingredient'].length != 0) {
        let ings = ''
        for (let ing of item_dict['ingredient']) {
            ings += rec_spawn(ing, tran_dict, lang, true)
        }
        fill_blank(document.getElementById('js_item_if_ing'), ings, '1')
    } else {
        fill_blank(document.getElementById('js_item_if_ing'), translate(lang, tran_dict, 'text.dec:ingredient_no.name'), '1')
    }
    if (components.hasOwnProperty('minecraft:max_stack_size')) {
        insertData(translate(lang, tran_dict, 'text.dec:stack_max.name'), String(components['minecraft:max_stack_size']));
    } else {
        insertData(translate(lang, tran_dict, 'text.dec:stack_max.name'), '64');
    }
    if (components.hasOwnProperty('minecraft:cooldown')) {
        insertData("冷却类型/等级", String(components['minecraft:cooldown']['category']), String(components['minecraft:cooldown']['duration']) + 's');
    }
    if (components.hasOwnProperty('minecraft:enchantable')) {
        insertData("附魔类型/等级", String(components['minecraft:enchantable']['slot']), String(components['minecraft:enchantable']['value']));
    }
    if (components.hasOwnProperty('minecraft:allow_off_hand')) {
        if (components['minecraft:allow_off_hand']) {
            insertData("副手使用", '允许');
        }
    }
    if (components.hasOwnProperty('minecraft:foil')) {
        if (components['minecraft:foil']) {
            insertData("附魔光泽", '有')
        }
    }
    if (components.hasOwnProperty('minecraft:food')) {
        insertData(translate(lang, tran_dict, 'text.dec:food_time.name'), String(components['minecraft:food']['nutrition']));
        if (components['minecraft:food'].hasOwnProperty(['saturation_modifier'])) {
            insertData("饱和度", String(components['minecraft:food']['saturation_modifier']));
        }
        if (components.hasOwnProperty('minecraft:use_duration')) {
            insertData("使用时间", String(components['minecraft:use_duration']) + 's');
        }
    }
    if (item_dict['texture'] != '') {
        document.getElementById('js_item_textures').innerHTML = '<img loading="lazy" class="item-image" src="static/data/' + item_dict['texture'] + '.png">'
    }
    if (item_dict['annotation'].length != 0) {
        let ann = ''
        for (let a of item_dict['annotation']) {
            ann = ann + a + '<br>'
        }
        quote(lang, AddTran, ann).then(outp => {
                document.getElementById('js_item_annotation').innerHTML += outp;
        })
    }else{
        document.getElementById('js_item_annotation').innerHTML += '暂时还没有介绍哦，欢迎补充。';
    }

}
window.onload = items_li_spawn()

window.onkeydown = function () {
    if (event.keyCode == 27) {
        history.back()
    }
}
