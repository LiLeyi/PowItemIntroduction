function page_spawn(s, l) {
    let tran_dict = [DefaultTran]
    //标题
    // let page_title = window.AddName + translate(lang,tran_dict,'text.dec:title.name')
    // document.title = page_title
    // document.getElementById('title').innerHTML = page_title

    //语言选择
    lang_str = ''
    window.LangType.forEach(l => {
        lang_str += '<option value="' + l + '">' + l + '</option>'
    })
    document.getElementById("lang_select").innerHTML = lang_str

    //默认选择
    if (l == undefined) {
        l = 'zh_CN'
    }
    document.getElementById("lang_select").value = l

    //物品列表
    let items_list = document.getElementById("items_list_ul");
    let str = '';
    Object.keys(window.AddData).forEach(function (item) {
        let id_infact = item + '█' + window.AddData[item]['lang'][lang]
        function add_str(strf) {
            let a_h = 'introduction.html?item=' + String(item) + '&lang=' + l
            let name = undefined
            if(window.AddData[item]['lang'][lang] == undefined){
                name = window.AddData[item]['beh']['components']['minecraft:display_name']['value']
            } else {
                name = window.AddData[item]['lang'][lang]
            }
            strf = strf + '<div class="item" id="' + id_infact + '" onClick="window.open(\''+a_h+'\',\'_self\')"><img onerror="javascript:this.hidden = true" loading="lazy" class="item_icon" src="static/data/' + window.AddData[item]['texture'] + '.png">' + String(name) + '</div>'
            return strf
        }
        if (s == 'undefined' || s == '') {
            str = add_str(str)
        } else if (id_infact.indexOf(s) != -1) {
            str = add_str(str)
        }
    });
    items_list.innerHTML = str;

    document.getElementById('total_number').innerHTML = translate(lang,tran_dict,'text.dec:total_number.name') + String(Object.keys(window.AddData).length)
    document.getElementById('search_content').placeholder = translate(lang,tran_dict,'text.dec:search_content.name')
    document.getElementById('search_button').value = translate(lang,tran_dict,'text.dec:search_button.name')
}
function search() {
    let k = String(document.getElementById('search_content').value);
    if (k == '' || k == undefined) {
        if (p_dic['lang'] == undefined) {
            window.location.replace("index.html")
        } else {
            window.location.replace("index.html?lang=" + p_dic['lang'])
        }
    } else {
        set_p('index.html', 'search', k)
    }
}

window.onkeydown = function () {
    if (event.keyCode == 13) {
        search()
        return false
    }
}
let lang = ''
let p_dic = get_p(window.location.href);
if (p_dic['search'] == undefined) {
    document.getElementById('search_content').value = ''
} else {
    document.getElementById('search_content').value = String(decodeURI(p_dic['search']))
}
if (p_dic['lang'] == undefined) {
    lang = 'zh_CN'
} else {
    lang = p_dic['lang']
}

window.onload = page_spawn(decodeURI(p_dic['search']), p_dic['lang'])

document.getElementById('lang_select').onchange = function () {
    let lang_select_ele = document.getElementById('lang_select')
    let lang_index = lang_select_ele.selectedIndex
    lang = lang_select_ele.options[lang_index].value
    set_p('index.html', 'lang', lang)
}