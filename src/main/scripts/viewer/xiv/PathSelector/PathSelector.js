/**
 * @preserve Copyright 2014 Washington University
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without modification, 
 * are permitted provided that the following conditions are met:
 * ·         Redistributions of source code must retain the above copyright notice, 
 *   this list of conditions and the following disclaimer.
 * ·         Redistributions in binary form must reproduce the above copyright notice, 
 * this list of conditions and the following disclaimer in the documentation and/or other 
 * materials provided with the distribution.
 *  ·         Neither the name of Washington University nor the names of its contributors 
 * may be used to endorse or promote products derived from this software without specific
 *  prior written permission.
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF 
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL 
 * THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, 
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT 
 * OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) 
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR 
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS 
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * 
 * @author sunilk@mokacreativellc.com (Sunil Kumar)
 */

// goog
goog.require('goog.dom');
goog.require('goog.string');

// utils
goog.require('utils.events');

// xiv
goog.require('xiv.Widget');


/**
 *
 * @constructor
 * @extends {xiv.Widget}
 */
goog.provide('xiv.PathSelector');
xiv.PathSelector = function () {
    window.console.log(xiv.Widget);
    goog.base(this, xiv.PathSelector.ID_PREFIX);
    //
    // Other init functions
    //
    utils.events.addEventManager(this, xiv.PathSelector.EventType);

}
goog.inherits(xiv.PathSelector, xiv.Widget);
goog.exportSymbol('xiv.PathSelector', xiv.PathSelector);



xiv.PathSelector.ID_PREFIX = /**@type {string} @const*/ 'xiv.PathSelector';



/**
 * Event types.
 * @enum {string}
 */
xiv.PathSelector.EventType = {
  //MOUSEOVER: goog.events.getUniqueId('mouseover'),
};






