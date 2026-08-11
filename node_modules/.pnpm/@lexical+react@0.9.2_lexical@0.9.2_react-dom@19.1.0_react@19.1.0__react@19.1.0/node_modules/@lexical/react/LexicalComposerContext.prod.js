/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';var c=require("react");let d=c.createContext(null);exports.LexicalComposerContext=d;exports.createLexicalComposerContext=function(a,e){let b=null;null!=a&&(b=a[1]);return{getTheme:function(){return null!=e?e:null!=b?b.getTheme():null}}};
exports.useLexicalComposerContext=function(){let a=c.useContext(d);if(null==a)throw Error("Minified Lexical error #8; visit https://lexical.dev/docs/error?code=8 for the full message or use the non-minified dev environment for full errors and additional helpful warnings.");return a}
