function get_p(url) {
    let s_start = 0;
    let s_iskey = 1;
    let s_key = '';
    let s_value = '';
    let ret_dict = {}
    for (let n in url) {
        let l = url[n]
        if (s_start == 1 && l != '=' && s_iskey == 1) {
            s_key = s_key + String(l)
        };
        if (s_start == 1 && l == '=' && s_iskey == 1) {
            s_iskey = 0
        };
        if (s_start == 1 && l != '&' && s_iskey == 0 && l != '=') {
            s_value = s_value + String(l)
        };
        if (s_start == 1 && l == '&' && s_iskey == 0 && s_key != '') {
            ret_dict[s_key] = s_value
            s_value = ''
            s_key = ''
            s_iskey = 1
        };
        if (l == '?' && s_start == 0) {
            s_start = 1
        }
    };
    if (s_key != '' && s_value != '') {
        ret_dict[s_key] = s_value
    }
    return (ret_dict)
}

function set_p(or, k, v) {
    let p = get_p(window.location.href)
    p[k] = v
    let p_txt = ''
    Object.keys(p).forEach(ky => {
        p_txt += ky + '=' + p[ky] + '&'
    })
    p_txt = p_txt.slice(0, p_txt.length - 1)
    window.location.replace(or + "?" + p_txt)
}

function translate(lang, langlist, rawtext, no_color = true) {
    for (let langdict of langlist) {
        if (Object.keys(langdict[lang]).indexOf(rawtext) != -1) {
            let tr = langdict[lang][rawtext]
            let tr_af = ''
            if (no_color) {
                let ig_l = [
                    '§a', '§b', '§c', '§d', '§e', '§f', '§g', '§h', '§i', '§j', '§k', '§l', '§m', '§n', '§o', '§p', '§q', '§r', '§s', '§t', '§u',
                    '§1', '§2', '§3', '§4', '§5', '§6', '§7', '§8', '§9', '§0'
                ]
                for (let l in tr) {
                    tr_af += tr[l]
                    if (ig_l.indexOf(tr_af.slice(-2)) != -1) {
                        tr_af = tr_af.slice(0, -2)
                    }
                }
            } else {
                tr_af = tr
            }
            return tr_af
        }
    }
    return null
}

async function quote(lang, langdict, raw_sentence) {
    /*输入语言，语言文件，句子。将句子中\*xxx.xxx:xxx.name*\翻译成对应文本。将\*path*dict_path*\翻译成static/data对应文件中对应键的值*/
    let targets = raw_sentence.match(/\\\*(\S*?)\*\\/g)
    let cur_sentence = raw_sentence
    while (targets != null) {
        if (targets.length > 0) {
            target = targets[0].slice(2, -2)
            if (target.indexOf('*') != -1) {
                /*后者*/
                let file_path = target.match(/(\S*?)\*/g)[0].slice(0, -1)
                let dic_path = target.match(/\*(\S*)/g)[0].slice(1)
                file_path = 'static/data/' + file_path
                let resp = await fetch(file_path)
                let dic = await resp.json()
                let target_value = eval('dic' + dic_path)
                let target_after = target_value
                cur_sentence = cur_sentence.replace('\\*' + target + '*\\', target_after)
            } else {
                /*前者*/
                let target_after = target
                if (target in langdict[lang]) {
                    target_after = langdict[lang][target]
                }
                cur_sentence = cur_sentence.replace('\\*' + target + '*\\', target_after)
            }
            targets = cur_sentence.match(/\\\*(\S*?)\*\\/g)
        }
    }
    return cur_sentence
}

function rec_spawn(rec_id, lang_list, lang, has_div = false) {
    if (rec_id in window.RecData) {
        let str = '';
        if (window.RecData[rec_id]['type'] == 'shaped' || window.RecData[rec_id]['type'] == 'shapeless') {
            str = rec_shaped_and_less(rec_id, lang_list, lang)
        } else if (window.RecData[rec_id]['type'] == 'furnace') {
            str = rec_furnace(rec_id, lang_list, lang)
        } else if (window.RecData[rec_id]['type'] == 'brewing') {
            str = rec_brewing(rec_id, lang_list, lang)
        }
        if (has_div) {
            return str
        } else {
            return str
        }
    } else {
        return null
    }
}

function buildGirdItem(inptar){
    return `<img src="${inptar[2]}"
                         onerror="javascript:{this.src=\'static/data/textures/ui/wb_help.png\';this.err = true;this.style.backgroundColor = stringToColor('${inptar[0]}');this.style.transition = 'background-color 0.3s ease';}"  loading="lazy" 
                        ${`onclick="{if(!this.err) {window.open(\'` + (inptar.length == 5? inptar[4]:"") + `\', \'_self\');}else{ newToast('${inptar[1]}');}}"`}
                      class="recipe-icon">`
}

function rec_get_id_data_name(i, lang_list, lang) {
    let i_data = -1
    let i_id = i
    let a_able = true
    let id_without_np = ''
    if (i.match(/:/g).length == 2) {
        let c = 0
        i_id = ''
        let i_data_str = ''
        for (let l of i) {
            if (l == ':') {
                c += 1
                if (c <= 1) {
                    i_id += l
                }
            } else if (c <= 1) {
                i_id += l
            } else {
                i_data_str += l
            }
        }
        i_data = Number(i_data_str)
    } else {
        let c = 0
        for (let l of i) {
            if (l == ':') {
                c = 1
            } else if (c == 1) {
                id_without_np += l
            }
        }
    }
    let i_name = i_id
    if (i_id.match(/minecraft:/) != null && i_id.match(/minecraft:/).length > 0) {
        a_able = false
        i_name = i_id.replace(/minecraft:/, '')
    }
    let r_name = null;
    let i_tr = translate(lang, lang_list, 'item.' + i_name + '.name')
    if (i_tr == null) {
        i_tr = translate(lang, lang_list, 'item.' + i_name)
    }
    if (i_tr == null) {
        i_tr = translate(lang, lang_list, 'tile.' + i_name + '.name')
    }
    if (i_tr == null) {
        i_tr = translate(lang, lang_list, 'tile.' + i_name)
    }
    if (i_tr == null) {
        i_tr = translate(lang, lang_list, 'item.spawn_egg.entity.' + i_name + '.name')
    }

    r_name = i_tr;
    if(r_name == null){
        r_name = i_id;
    }

    if (i_data != null && i_data > 0) {
        i_tr += translate(lang, lang_list, 'text.dec:recipe_data.name') + Number(i_data)
    }
    if (a_able) {
        if (i_id in window.AddData) {
            i_tr = '<img onerror="javascript:this.src=\'static/data/textures/ui/wb_help.png\';" loading="lazy" class="rec_icon" src="static/data/' + window.AddData[i_id]['texture'] + '.png">' + i_tr
        }
        i_tr = '<a class="rec_a" href="introduction.html?item=' + String(i_id) + '&lang=' + lang + '">' + i_tr + '</a>';
        let i_src = '';
        if(i_id in window.AddData){
            i_src = 'static/data/' + window.AddData[i_id]['texture'] + '.png';
        }else{
            i_src = 'static/data/textures/items/' + i_id.split(":")[1] + '.png';
        }

        return [i_id, r_name, i_src, i_tr, "introduction.html?item=" + String(i_id) + '&lang=' + lang]
    } else {
        i_tr = '<img onerror="javascript:this.src=\'static/data/textures/ui/wb_help.png\';" loading="lazy" class="rec_icon" src="static/data/textures/items/' + i_id.slice(10) + '.png">' + i_tr;
        let i_src = 'static/data/textures/items/' + i_id.slice(10) + '.png';
        return [i_id, r_name, i_src, i_tr]
    }
}
function rec_shaped_and_less(rec_id, lang_list, lang) {
    const recipeType = window.RecData[rec_id].type;


    let html = `<div class="recipe-card" data-type="${recipeType}">
        <div class="recipe-pattern">`;
    let data = window.RecData[rec_id];
    if (data.type == "shaped") {
        window.RecData[rec_id].pattern.forEach(row => {
            row.forEach(slot => {
                let target;
                if (slot) target = rec_get_id_data_name(slot[0], lang_list, lang);

                const itemHtml = slot ?
                    buildGirdItem(target) :
                    '<div class="empty-slot"></div>';
                html += `<div class="recipe-slot">${itemHtml}</div>`;
            });
        });
    } else {
        for (let keyId in window.RecData[rec_id].count) {
            let target;
            if (keyId) target = rec_get_id_data_name(keyId, lang_list, lang);
            const itemHtml = buildGirdItem(target);
            html += `<div class="recipe-slot" >${itemHtml}</div>`;
        }
    }

    const outputItem = rec_get_id_data_name(window.RecData[rec_id].result[0].item, lang_list, lang)[3];
    html += `</div>
        <div class="recipe-meta">
            <div class="recipe-output">
                <span>输出</span>
                <span class="output-item">${outputItem}</span>
            </div>
        </div>
    </div>`;

    return html;
}
// 颜色生成函数（保持之前版本）
function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    return `hsl(${Math.abs(hash % 360)}, 70%, 60%)`;
}
function rec_furnace(rec_id, lang_list, lang) {
    const inptar = rec_get_id_data_name(window.RecData[rec_id]['pattern'], lang_list, lang);
    const target = rec_get_id_data_name(window.RecData[rec_id]['result'], lang_list, lang);
    
    return `<div class="recipe-card">
        <div class="furnace-recipe">
            <div class="furnace-input"><div class="recipe-slot">${buildGirdItem(inptar)}</div></div>
            <div class="furnace-icon">➔
            </div>
            <div class="furnace-output"><div class="recipe-slot">${buildGirdItem(target)}</div></div>
        </div>
        ${window.RecData[rec_id]['tags'].length ? `
            <div class="furnace-tags">
                ${translate(lang, lang_list, 'text.dec:recipe_furnace_1.name')}
                ${window.RecData[rec_id]['tags'].map(t => 
                    translate(lang, lang_list, 'tile.' + t + '.name')).join(', ')}
            </div>
        ` : ''}
    </div>`;
}

function rec_brewing(rec_id, lang_list, lang) {
    let str = translate(lang, lang_list, 'text.dec:recipe_brewing.name')
    let [inp_id, inp_name, inp_data, inp_tr] = rec_get_id_data_name(window.RecData[rec_id]['pattern']['input'], lang_list, lang)
    let [rea_id, rea_name, rea_data, rea_tr] = rec_get_id_data_name(window.RecData[rec_id]['pattern']['reagent'], lang_list, lang)
    let [out_id, out_name, out_data, out_tr] = rec_get_id_data_name(window.RecData[rec_id]['result'], lang_list, lang)
    str += inp_tr + '+' + rea_tr + '   -->   ' + out_tr
    return str
}

function rec_smithing(rec_id, lang_list, lang) {
    let str = translate(lang, lang_list, 'text.dec:recipe_brewing.name')
    let [temple_id, temple_name, temple_data, temple_tr] = rec_get_id_data_name(window.RecData[rec_id]['pattern']['temple'], lang_list, lang)
    let [base_id, base_name, base_data, base_tr] = rec_get_id_data_name(window.RecData[rec_id]['pattern']['base'], lang_list, lang)
    let [addition_id, addition_name, addition_data, addition_tr] = rec_get_id_data_name(window.RecData[rec_id]['pattern']['addition'], lang_list, lang)
    let [out_id, out_name, out_data, out_tr] = rec_get_id_data_name(window.RecData[rec_id]['result'], lang_list, lang)
    str += temple_tr + '+' + base_tr + '+' + addition_tr + '   -->   ' + out_tr
    return str
}


function newAlert(str) {
    // 创建样式（仅第一次执行时添加）
    if (!document.querySelector('#alert-styles')) {
        const style = document.createElement('style');
        style.id = 'alert-styles';
        style.textContent = `
            .alert-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 999;
                visibility: hidden;
                opacity: 0;
                transition: all 0.3s ease;
            }

            .alert-box {
                background: white;
                padding: 25px;
                border-radius: 15px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                max-width: 400px;
                width: 90%;
                transform: scale(0.7);
                transition: all 0.3s ease;
                position: relative;
            }

            .alert-box.active {
                transform: scale(1);
            }

            .alert-overlay.active {
                visibility: visible;
                opacity: 1;
            }

            .close-btn {
                position: absolute;
                top: 15px;
                right: 15px;
                background: none;
                border: none;
                font-size: 1.2em;
                cursor: pointer;
                color: #666;
            }

            .alert-content {
                text-align: center;
            }

            .alert-title {
                font-size: 1.5em;
                margin-bottom: 15px;
                color: #333;
            }

            .alert-message {
                color: #666;
                line-height: 1.5;
                margin-bottom: 20px;
            }

            .alert-buttons {
                display: flex;
                justify-content: center;
                gap: 10px;
            }

            .alert-button {
                padding: 8px 20px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .alert-button.confirm {
                background: #4CAF50;
                color: white;
            }

            .alert-button.cancel {
                background: #f44336;
                color: white;
            }

            .alert-button:hover {
                opacity: 0.9;
                transform: translateY(-1px);
            }
        `;
        document.head.appendChild(style);
    }

    // 创建弹窗元素
    const overlay = document.createElement('div');
    overlay.className = 'alert-overlay';
    overlay.innerHTML = `
        <div class="alert-box">
            <button class="close-btn">&times;</button>
            <div class="alert-content">
                <h2 class="alert-title">温馨提示</h2>
                <p class="alert-message">${str}</p>
                <div class="alert-buttons">
                    <button class="alert-button confirm">确定</button>
                    <button class="alert-button cancel">取消</button>
                </div>
            </div>
        </div>
    `;

    // 添加到页面
    document.body.appendChild(overlay);

    // 获取元素引用
    const alertBox = overlay.querySelector('.alert-box');
    const closeBtn = overlay.querySelector('.close-btn');
    const confirmBtn = overlay.querySelector('.confirm');
    const cancelBtn = overlay.querySelector('.cancel');

    // 显示弹窗
    setTimeout(() => {
        overlay.classList.add('active');
        alertBox.classList.add('active');
    }, 10);

    // 关闭函数
    const hideAlert = () => {
        overlay.classList.remove('active');
        alertBox.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
    };

    // 绑定事件
    closeBtn.addEventListener('click', hideAlert);
    confirmBtn.addEventListener('click', hideAlert);
    cancelBtn.addEventListener('click', hideAlert);
    overlay.addEventListener('click', (e) => {
        if(e.target === overlay) hideAlert();
    });
}

function newToast(message) {
    // 确保样式只注入一次
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            #toast-container {
                position: fixed;
                bottom: 20px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 9999;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 10px;
            }

            .toast {
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 12px 24px;
                border-radius: 25px;
                font-size: 14px;
                font-family: Arial, sans-serif;
                backdrop-filter: blur(5px);
                opacity: 0;
                transform: translateY(100%);
                transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                max-width: 80vw;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .toast.show {
                opacity: 1;
                transform: translateY(0);
            }
        `;
        document.head.appendChild(style);
    }

    // 创建容器（如果不存在）
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    // 创建toast元素
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    // 添加到容器
    container.appendChild(toast);

    // 触发动画
    setTimeout(() => toast.classList.add('show'), 10);

    // 自动消失
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}
