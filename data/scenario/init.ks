[iscript]
sf._saveload = {
    slot: mp.slot != null ? parseInt(mp.slot) : 8,
    exvar: mp.exvar || "",
    exvar_join: mp.exvar_join || "",
    fadetime: mp.fadetime != null ? parseInt(mp.fadetime) : 100,
    fademask: (mp.fademask == "true" ? true : false),
    maskcolor: mp.maskcolor || "black",
    maskimage: mp.maskimage || "",
    masktime: (mp.fademask == "true" ? parseInt(mp.fadetime) : 0),
    memory: mp.memory != null ? parseInt(mp.memory) : 2,
    hold: (mp.hold == "true" ? false : true),
    sebuf: mp.sebuf != null ? parseInt(mp.sebuf) : 0,

    dialog_overwrite: (mp.dialog_overwrite == "true" ? true : false),
    dialog_save: (mp.dialog_save == "false" ? true : false),
    dialog_load: (mp.dialog_load == "true" ? true : false),
    dialog_delete: (mp.dialog_delete == "true" ? true : false),

    message_save: mp.message_save || "",
    message_load: mp.message_load || "",
    message_overwrite: mp.message_overwrite || "",
    message_delete: mp.message_delete || "",

    auto: (mp.auto == "true" ? true : false),
    slot_bg_auto: mp.slot_bg_auto || "",
    slot_bg_auto_h: mp.slot_bg_auto_h || "",

    //デザインカスタマイズ
    bg_save: mp.bg_save || "salo/baseS.jpg",
    bg_load: mp.bg_load || "salo/baseL.jpg",
    area_x: mp.area_x != null ? parseInt(mp.area_x) : 78,
    area_y: mp.area_y != null ? parseInt(mp.area_y) : 240,
    save_se: mp.save_se || "button1.ogg",
    load_se: mp.load_se || "button1.ogg",
    save_enterse: mp.save_enterse || "",
    load_enterse: mp.load_enterse || "",

    scroll_width: mp.scroll_width != null ? parseInt(mp.scroll_width) : 12,
    scroll_thumb_radius: mp.scroll_thumb_radius != null ? parseInt(mp.scroll_thumb_radius) : 0,
    scroll_thumb_color: mp.scroll_thumb_color || "#9B0D49",
    scroll_base_radius: mp.scroll_base_radius != null ? parseInt(mp.scroll_base_radius) : 0,
    scroll_base_color: mp.scroll_base_color || "transparent",

    back_width: mp.back_width != null ? parseInt(mp.back_width) : "auto",
    back_height : mp.back_height != null ? parseInt(mp.back_height) : "auto",
    back_x: mp.back_x != null ? parseInt(mp.back_x) : 1170,
    back_y: mp.back_y != null ? parseInt(mp.back_y) : 10,
    back_img: mp.back_img || "backico.png",
    back_img_h: "",
    back_se: mp.back_se || "card9.ogg",
    back_enterse: mp.back_enterse || "card2.ogg",

    page_img: mp.page_img || "../others/plugin/saveload_ex/image/{page}.png",
    page_img_h: "",
    page_img_a: "",
    page_x: mp.page_x != null ? parseInt(mp.page_x) : 150,     
    page_y: mp.page_y != null ? parseInt(mp.page_y) : 100,
    page_vertical: (mp.page_vertical == "true" ? true : false),
    page_margin: mp.page_margin != null ? parseInt(mp.page_margin) : 30,
    page_se: mp.page_se || "card3.ogg",
    page_enterse: mp.page_enterse || "card2.ogg",

    slot_width: mp.slot_width != null ? parseInt(mp.slot_width) : 260,
    slot_height: mp.slot_height != null ? parseInt(mp.slot_height) : 200,
    slot_marginx: mp.slot_marginx != null ? parseInt(mp.slot_marginx) : 26,
    slot_marginy: mp.slot_marginy != null ? parseInt(mp.slot_marginy) : 20,
    slot_column: mp.slot_column != null ? parseInt(mp.slot_column) : 4,
    slot_bg: mp.slot_bg || "../others/plugin/saveload_ex/image/culumn1.png",
    slot_bg_h: "",
    slot_vertical: (mp.slot_vertical == "false" ? true : false),

    num: (mp.num == "true" ? true : false),
    num_format: mp.num_format || "{num}",
    num_length: mp.num_length != null ? parseInt(mp.num_length) : 1,   
    num_width: mp.num_width != null ? parseInt(mp.num_width) : 60,   
    num_height: mp.num_height != null ? parseInt(mp.num_height) : 144,
    num_x: mp.num_x != null ? parseInt(mp.num_x) : 0,    
    num_y: mp.num_y != null ? parseInt(mp.num_y) : 0,     
    num_color: mp.num_color || "#e5e5e5",   
    num_align: mp.num_align || "left",   
    num_size: mp.num_size != null ? parseInt(mp.num_size) : 24,

    thumb_width: mp.thumb_width != null ? parseInt(mp.thumb_width) : 256,
    thumb_height: mp.thumb_height != null ? parseInt(mp.thumb_height) : "145",
    thumb_x: mp.thumb_x != null ? parseInt(mp.thumb_x) : 0,
    thumb_y: mp.thumb_y != null ? parseInt(mp.thumb_y) : 1,
    thumb_noimage: mp.thumb_noimage || "../others/plugin/saveload_ex/image/noimage.png",

    date: (mp.date == "false" ? false : true),
    date_width: mp.date_width != null ? parseInt(mp.date_width) : 300,
    date_height: mp.date_heigh != null ? parseInt(mp.date_heigh) : 30,
    date_x: mp.date_x != null ? parseInt(mp.date_x) : 18,
    date_y: mp.date_y != null ? parseInt(mp.date_y) : 155,
    date_color: mp.date_color || "#e5e5e5",
    date_align: mp.date_align || "left",
    date_size: mp.num_size != null ? parseInt(mp.date_size) : 26,

    text: (mp.text == "false" ? false : true),
    text_width: mp.text_width != null ? parseInt(mp.text_width) : 300,
    text_height: mp.text_heigh != null ? parseInt(mp.text_heigh) : 50,
    text_x: mp.text_x != null ? parseInt(mp.text_x) : 210,
    text_y: mp.text_y != null ? parseInt(mp.text_y) : 60,
    text_color: mp.text_color || "#e5e5e5",
    text_align: mp.text_align || "left",
    text_size: mp.num_size != null ? parseInt(mp.text_size) : 26,

    var_width: mp.var_width != null ? parseInt(mp.var_width) : 300,
    var_height: mp.var_heigh != null ? parseInt(mp.var_heigh) : 30,
    var_x: mp.var_x != null ? parseInt(mp.var_x) : 210,
    var_y: mp.var_y != null ? parseInt(mp.var_y) : 30,
    var_color: mp.var_color || "#e5e5e5",
    var_align: mp.var_align || "left",
    var_size: mp.num_size != null ? parseInt(mp.var_size) : 24,

    lock: (mp.lock == "true" ? true : false),
    lock_width: mp.lock_width != null ? parseInt(mp.lock_width) : "auto",
    lock_height: mp.lock_heigh != null ? parseInt(mp.lock_heigh) : "auto",
    lock_x: mp.lock_x != null ? parseInt(mp.lock_x) : 590,
    lock_y: mp.lock_y != null ? parseInt(mp.lock_y) : 5,
    lock_img_lock: mp.lock_img_lock || "../others/plugin/saveload_ex/image/lock.png",
    lock_img_lock_h: "",
    lock_img_unlock: mp.lock_img_unlock || "../others/plugin/saveload_ex/image/unlock.png",
    lock_img_unlock_h: "",
    lock_se: mp.lock_se || "",
    lock_enterse: mp.lock_enterse || "",

    delete: (mp.delete == "true" ? true : false),
    delete_width: mp.delete_width != null ? parseInt(mp.delete_width) : "auto",
    delete_height: mp.delete_heigh != null ? parseInt(mp.delete_heigh) : "auto",
    delete_x: mp.delete_x != null ? parseInt(mp.delete_x) : 640,
    delete_y: mp.delete_y != null ? parseInt(mp.delete_y) : 5,
    delete_img_delete: mp.delete_img_delete || "../others/plugin/saveload_ex/image/delete.png",
    delete_img_delete_h: "",
    delete_img_undelete: mp.delete_img_undelete || "../others/plugin/saveload_ex/image/undelete.png",
    delete_img_undelete_h: "",
    delete_se: mp.delete_se || "",
    delete_enterse: mp.delete_enterse || "",

    new: (mp.new == "true" ? true : false),
    new_width: mp.new_width != null ? parseInt(mp.new_width) : "auto",
    new_height: mp.new_heigh != null ? parseInt(mp.new_heigh) : "auto",
    new_x: mp.new_x != null ? parseInt(mp.new_x) : 0,
    new_y: mp.new_y != null ? parseInt(mp.new_y) : 0,
    new_img: mp.new_img || "../others/plugin/saveload_ex/image/new.png",

    comment: (mp.comment == "true" ? true : false),
    comment_width: mp.comment_width != null ? parseInt(mp.comment_width) : 380,
    comment_height: mp.comment_heigh != null ? parseInt(mp.comment_heigh) : "auto",
    comment_x: mp.comment_x != null ? parseInt(mp.comment_x) : 210,
    comment_y: mp.comment_y != null ? parseInt(mp.comment_y) : 110,
    comment_button_img: mp.comment_button_img || "../others/plugin/saveload_ex/image/unlock.png",
    comment_button_img_h: "",
    comment_button_width: mp.comment_button_width != null ? parseInt(mp.comment_button_width) : "auto",
    comment_button_height: mp.comment_button_heigh != null ? parseInt(mp.comment_button_heigh) : "auto",
    comment_button_x: mp.comment_button_x != null ? parseInt(mp.comment_button_x) : 610,
    comment_button_y: mp.comment_button_y != null ? parseInt(mp.comment_button_y) : 110,
    comment_placeholder: mp.comment_placeholder || "コメント",
    comment_size: mp.num_size != null ? parseInt(mp.comment_size) : 20,
    comment_se: mp.comment_se || "",
    comment_enterse: mp.comment_enterse || "",
}

if(mp.saveload !== undefined){
    sf._saveload = $.extend(true, {}, sf._saveload, mp.saveload)
}

TYRANO.kag.variable.sf._saveload._cssfile = "./data/others/plugin/saveload_ex/saveload.css"

//ロード時のCSS削除対策
$("._tmp_css").remove()
let style = $("<link />")
style.addClass("_tmp_css")
style.attr({
    rel: "stylesheet",
    href: TYRANO.kag.variable.sf._saveload._cssfile
})
$("head link:last").after(style);

[endscript]



[sysview type=save storage="./data/others/plugin/saveload_ex/html/save.html"]
[sysview type=load storage="./data/others/plugin/saveload_ex/html/load.html"]
[loadjs storage="plugin/saveload_ex/main.js"]
[loadcss file="./data/others/plugin/saveload_ex/saveload.css"]
[return]