// +----------------------------------------------------------------------
// | Update: 2020-06-21 00:00
// +----------------------------------------------------------------------
// | Author: Kerindax <1482152356@qq.com>
// +----------------------------------------------------------------------
const BASIC = 0; //基本区形式  A
const ALONE = 1; //单独形式    A
const HEAD  = 2; //头部形式    A_
const CENTR = 3; //中部形式   _A_
const REAR  = 4; //后部形式   _A

const convertRang = /[\u0622-\u064a\u0675-\u06d5]+/g; //转换范围；不包含哈语的0x0621字母,问号,双引号和Unicode区域的符号
const suffixRang = /[^\u0627\u062F-\u0632\u0648\u0688-\u0699\u06C0-\u06CB\u06D5]/g; //分割范围，有后尾的字符表达式
const extendRang = /[\ufb50-\ufdff\ufe70-\ufeff]/g; //扩展区范围；FB50-FDFF ->区域A    FE70-FEFF -> 区域B
const notExtendRang = /[^\ufb50-\ufdff\ufe70-\ufeff\s]+(\s[^\ufb50-\ufdff\ufe70-\ufeff\s]+)*/g; //不包含扩展区中部包含空格字符集；FB50-FDFF ->区域A    FE70-FEFF -> 区域B

//特助转换区，扩展区反向转换的时候需要替换
const symbolRang = /[\)\(\]\[\}\{\>\<\»\«]/g;
const symbolList = {
  ')': '(',
  '(': ')',
  ']': '[',
  '[': ']',
  '}': '{',
  '{': '}',
  '>': '<',
  '<': '>',
  '»': '«',
  '«': '»',
};

const {fromCharCode} = String;

/**
 * 维吾尔语总共有32字母，零号数组元素对应的是特助字符，最后加了哈萨克语和柯尔克孜语的四个字母
 */
class UyghurCharUtils {
  // 单字母列表
  charCode = {};
  // 双目字列表，转换扩展区的时候需要替换
  special = [
    { basic: [0x644, 0x627], extend: [0xfefc], link: [0xfee0, 0xfe8e], },// LA
    { basic: [0x644, 0x627], extend: [0xfefb], link: [0xfedf, 0xfe8e], },//_LA
  ];
  constructor() {
    /**
     * 基本码, 单独形式, 头部形式, 中部形式, 后部形式]
     * [  A  ,     A   ,    A_   ,   _A_  ,   _A   ]
     */
    [
      [0x626, 0xfe8b, 0xfe8b, 0xfe8c, 0xfe8c], // 1 --- 00-Hemze
      [0x627, 0xfe8d, 0xfe8d, 0xfe8e, 0xfe8e], // 0 --- 01-a   
      [0x6d5, 0xfee9, 0xfee9, 0xfeea, 0xfeea], // 0 --- 02-:e  
      [0x628, 0xfe8f, 0xfe91, 0xfe92, 0xfe90], // 1 --- 03-b   
      [0x67e, 0xfb56, 0xfb58, 0xfb59, 0xfb57], // 1 --- 04-p   
      [0x62a, 0xfe95, 0xfe97, 0xfe98, 0xfe96], // 1 --- 05-t   
      [0x62c, 0xfe9d, 0xfe9f, 0xfea0, 0xfe9e], // 1 --- 06-j   
      [0x686, 0xfb7a, 0xfb7c, 0xfb7d, 0xfb7b], // 1 --- 07-q   
      [0x62e, 0xfea5, 0xfea7, 0xfea8, 0xfea6], // 1 --- 08-h   
      [0x62f, 0xfea9, 0xfea9, 0xfeaa, 0xfeaa], // 0 --- 09-d   
      [0x631, 0xfead, 0xfead, 0xfeae, 0xfeae], // 0 --- 10-r   
      [0x632, 0xfeaf, 0xfeaf, 0xfeb0, 0xfeb0], // 0 --- 11-z   
      [0x698, 0xfb8a, 0xfb8a, 0xfb8b, 0xfb8b], // 0 --- 12-:zh 
      [0x633, 0xfeb1, 0xfeb3, 0xfeb4, 0xfeb2], // 1 --- 13-s   
      [0x634, 0xfeb5, 0xfeb7, 0xfeb8, 0xfeb6], // 1 --- 14-x   
      [0x63a, 0xfecd, 0xfecf, 0xfed0, 0xfece], // 1 --- 15-:gh 
      [0x641, 0xfed1, 0xfed3, 0xfed4, 0xfed2], // 1 --- 16-f   
      [0x642, 0xfed5, 0xfed7, 0xfed8, 0xfed6], // 1 --- 17-:k  
      [0x643, 0xfed9, 0xfedb, 0xfedc, 0xfeda], // 1 --- 18-k   
      [0x6af, 0xfb92, 0xfb94, 0xfb95, 0xfb93], // 1 --- 19-g   
      [0x6ad, 0xfbd3, 0xfbd5, 0xfbd6, 0xfbd4], // 1 --- 20-:ng 
      [0x644, 0xfedd, 0xfedf, 0xfee0, 0xfede], // 1 --- 21-l   
      [0x645, 0xfee1, 0xfee3, 0xfee4, 0xfee2], // 1 --- 22-m   
      [0x646, 0xfee5, 0xfee7, 0xfee8, 0xfee6], // 1 --- 23-n   
      [0x6be, 0xfbaa, 0xfbac, 0xfbad, 0xfbab], // 1 --- 24-:h  
      [0x648, 0xfeed, 0xfeed, 0xfeee, 0xfeee], // 0 --- 25-o   
      [0x6c7, 0xfbd7, 0xfbd7, 0xfbd8, 0xfbd8], // 0 --- 26-u   
      [0x6c6, 0xfbd9, 0xfbd9, 0xfbda, 0xfbda], // 0 --- 27-:o  
      [0x6c8, 0xfbdb, 0xfbdb, 0xfbdc, 0xfbdc], // 0 --- 28-v   
      [0x6cb, 0xfbde, 0xfbde, 0xfbdf, 0xfbdf], // 0 --- 29-w   
      [0x6d0, 0xfbe4, 0xfbe6, 0xfbe7, 0xfbe5], // 1 --- 30-e   
      [0x649, 0xfeef, 0xfbe8, 0xfbe9, 0xfef0], // 1 --- 31-i   
      [0x64a, 0xfef1, 0xfef3, 0xfef4, 0xfef2], // 1 --- 32-y 
      
      [0x6c5, 0xfbe0, 0xfbe0, 0xfbe1, 0xfbe1], // 0 --- kz o_
      [0x6c9, 0xfbe2, 0xfbe2, 0xfbe3, 0xfbe3], // 0 --- kz o^
      [0x62d, 0xfea1, 0xfea3, 0xfea4, 0xfea2], // 1 --- kz h
      [0x639, 0xfec9, 0xfecb, 0xfecc, 0xfeca], // 1 --- kz c
    ].forEach(row => row.map(item => fromCharCode(item)).forEach((item, index, list) => this.charCode[item] = list));
  };
  /**
   * 基本区->转换->扩展区
   * @param source 要转换的内容，可以包含混合字符串
   * @return 已转换的内容
   */
  Basic2Extend(source) {
    return source.replace(convertRang, word => {
      let returns = word
        .replace(suffixRang, ch => {
          return ch + '  ';
        })
        .trim()
        .replace(/^(\S)$/, (ch, $1) => {//单字母
          return this.getChar($1, ALONE);
        })
        .replace(/^(\S)(\S)/g, (ch, $1, $2) => {//首字母-没有尾
          return this.getChar($1, ALONE) + $2;
        })
        .replace(/(\S)(\S)$/, (ch, $1, $2) => {//最后字母-没有尾
          return $1 + this.getChar($2, ALONE);
        })
        .replace(/(\S)(\S)(\S)/g, (ch, $1, $2, $3) => {//中部字母-没有尾
          return $1 + this.getChar($2, ALONE) + $3;
        })
        .replace(/^(\S)\s/g, (ch, $1) => {//首字母-后部有尾
          return this.getChar($1, HEAD);
        })
        .replace(/(\S)(\S)\s/g, (ch, $1, $2) => {//中部字母-后部有尾
          return $1 + this.getChar($2, HEAD);
        })
        .replace(/\s(\S)\s/g, (ch, $1) => {//中部字母-前后有尾
          return this.getChar($1, CENTR);
        })
        .replace(/\s(\S)$/, (ch, $1) => {//最后字母-前部有尾
          return this.getChar($1, REAR);
        })
        .replace(/\s(\S)(\S)/g, (ch, $1, $2) => {//中部字母-前部有尾
          return this.getChar($1, REAR) + $2;
        });
      return this.extendLa(returns);
    });
  };
  /**
   * 扩展区   转换   基本区
   * @param source 要转换的内容
   * @return 已转换的内容
   */
  Extend2Basic(source) {
    return this.basicLa(source).replace(extendRang, ch => this.getChar(ch, BASIC));
  };
  /**
   * 基本区  转换   反向扩展区
   * @param source 要转换的内容
   * @return 已转换的内容
   */
  Basic2RExtend(source) {
    return this.reverseAscii(this.reverseSubject(this.Basic2Extend(source)));
  };
  /**
   * 反顺序扩展区   转换   基本区
   * @param source 要转换的内容
   * @return 已转换的内容
   */
  RExtend2Basic(source) {
    return this.Extend2Basic(this.reverseSubject(this.reverseAscii(source)));
  };
  /**
   * Ascii区反转
   */
  reverseAscii(source) {
    return source.replace(notExtendRang, (word) => {
      return word.split("").reverse().join("")
        .replace(symbolRang, ch => {
          return symbolList[ch] || ch;
        });
    });
  };
  /**
   * 对象反转
   */
  reverseSubject(str) {
    return str.replace(/.+/g, function (subject) {
      return subject.split("").reverse().join("");
    });
  };
  /**
   * 获取对应字母
   */
  getChar(ch, index) {
    let item = this.charCode[ch];
    return item ? item[index] : ch;
  };
  /**
   * La字母转换扩展区
   */
  extendLa(source) {
    this.special.forEach(item => {
      source = source.replace(this.getString(item.link), this.getString(item.extend));
    });
    return source;
  };
  /**
   * La字母转换基本区
   */
  basicLa(source) {
    this.special.forEach(item => {
      source = source.replace(this.getString(item.extend), this.getString(item.basic));
    });
    return source;
  };
  /**
   * 双目字母转换字符串
   */
  getString(value){
    return value.map(el => fromCharCode(el)).join('')
  }
}

try {
  if (global) {
    module.exports = UyghurCharUtils;
  }
} catch (error) {
  //browser
}
