// Copyright 2013 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


/**
 * @fileoverview The SafeHtml type and its builders.
 *
 * TODO(user): Link to document stating type contract.
 */

goog.provide('goog.html.SafeHtml');

goog.require('goog.array');
goog.require('goog.asserts');
goog.require('goog.dom.tags');
goog.require('goog.html.SafeStyle');
goog.require('goog.html.SafeUrl');
goog.require('goog.i18n.bidi.Dir');
goog.require('goog.i18n.bidi.DirectionalString');
goog.require('goog.object');
goog.require('goog.string');
goog.require('goog.string.Const');
goog.require('goog.string.TypedString');



/**
 * A string that is safe to use in HTML context in DOM APIs and HTML documents.
 *
 * A SafeHtml is a string-like object that carries the security type contract
 * that its value as a string will not cause untrusted script execution when
 * evaluated as HTML in a browser.
 *
 * Values of this type are guaranteed to be safe to use in HTML contexts,
 * such as, assignment to the innerHTML DOM property, or interpolation into
 * a HTML template in HTML PC_DATA context, in the sense that the use will not
 * result in a Cross-Site-Scripting vulnerability.
 *
 * Instances of this type must be created via the factory methods
 * ({@code goog.html.SafeHtml.from}, {@code goog.html.SafeHtml.htmlEscape}), etc
 * and not by invoking its constructor.  The constructor intentionally takes no
 * parameters and the type is immutable; hence only a default instance
 * corresponding to the empty string can be obtained via constructor invocation.
 *
 * @see goog.html.SafeHtml#from
 * @see goog.html.SafeHtml#htmlEscape
 * @constructor
 * @final
 * @struct
 * @implements {goog.i18n.bidi.DirectionalString}
 * @implements {goog.string.TypedString}
 */
goog.html.SafeHtml = function() {
  /**
   * The contained value of this SafeHtml.  The field has a purposely ugly
   * name to make (non-compiled) code that attempts to directly access this
   * field stand out.
   * @private {string}
   */
  this.privateDoNotAccessOrElseSafeHtmlWrappedValue_ = '';

  /**
   * A type marker used to implement additional run-time type checking.
   * @see goog.html.SafeHtml#unwrap
   * @const
   * @private
   */
  this.SAFE_HTML_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ =
      goog.html.SafeHtml.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_;

  /**
   * This SafeHtml's directionality, or null if unknown.
   * @private {?goog.i18n.bidi.Dir}
   */
  this.dir_ = null;
};


/**
 * @override
 * @const
 */
goog.html.SafeHtml.prototype.implementsGoogI18nBidiDirectionalString = true;


/** @override */
goog.html.SafeHtml.prototype.getDirection = function() {
  return this.dir_;
};


/**
 * @override
 * @const
 */
goog.html.SafeHtml.prototype.implementsGoogStringTypedString = true;


/**
 * Returns this SafeHtml's value a string.
 *
 * IMPORTANT: In code where it is security relevant that an object's type is
 * indeed {@code SafeHtml}, use {@code goog.html.SafeHtml.unwrap} instead of
 * this method. If in doubt, assume that it's security relevant. In particular,
 * note that goog.html functions which return a goog.html type do not guarantee
 * that the returned instance is of the right type. For example:
 *
 * <pre>
 * var fakeSafeHtml = new String('fake');
 * fakeSafeHtml.__proto__ = goog.html.SafeHtml.prototype;
 * var newSafeHtml = goog.html.SafeHtml.from(fakeSafeHtml);
 * // newSafeHtml is just an alias for fakeSafeHtml, it's passed through by
 * // goog.html.SafeHtml.from() as fakeSafeHtml instanceof goog.html.SafeHtml.
 * </pre>
 *
 * @see goog.html.SafeHtml#unwrap
 * @override
 */
goog.html.SafeHtml.prototype.getTypedStringValue = function() {
  return this.privateDoNotAccessOrElseSafeHtmlWrappedValue_;
};


if (goog.DEBUG) {
  /**
   * Returns a debug string-representation of this value.
   *
   * To obtain the actual string value wrapped in a SafeHtml, use
   * {@code goog.html.SafeHtml.unwrap}.
   *
   * @see goog.html.SafeHtml#unwrap
   * @override
   */
  goog.html.SafeHtml.prototype.toString = function() {
    return 'SafeHtml{' + this.privateDoNotAccessOrElseSafeHtmlWrappedValue_ +
        '}';
  };
}


/**
 * Performs a runtime check that the provided object is indeed a SafeHtml
 * object, and returns its value.
 * @param {!goog.html.SafeHtml} safeHtml The object to extract from.
 * @return {string} The SafeHtml object's contained string, unless the run-time
 *     type check fails. In that case, {@code unwrap} returns an innocuous
 *     string, or, if assertions are enabled, throws
 *     {@code goog.asserts.AssertionError}.
 */
goog.html.SafeHtml.unwrap = function(safeHtml) {
  // Perform additional run-time type-checking to ensure that safeHtml is indeed
  // an instance of the expected type.  This provides some additional protection
  // against security bugs due to application code that disables type checks.
  // Specifically, the following checks are performed:
  // 1. The object is an instance of the expected type.
  // 2. The object is not an instance of a subclass.
  // 3. The object carries a type marker for the expected type. "Faking" an
  // object requires a reference to the type marker, which has names intended
  // to stand out in code reviews.
  if (safeHtml instanceof goog.html.SafeHtml &&
      safeHtml.constructor === goog.html.SafeHtml &&
      safeHtml.SAFE_HTML_TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ ===
          goog.html.SafeHtml.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_) {
    return safeHtml.privateDoNotAccessOrElseSafeHtmlWrappedValue_;
  } else {
    goog.asserts.fail('expected object of type SafeHtml, got \'' +
                      safeHtml + '\'');
    return 'type_error:SafeHtml';
  }
};


/**
 * Shorthand for union of types that can be sensibly converted to strings.
 * @private
 * @typedef {string|number|boolean|!goog.string.TypedString|
 *           !goog.i18n.bidi.DirectionalString}
 */
goog.html.SafeHtml.StringLike_;


/**
 * Shorthand for union of types that can be sensibly converted to SafeHtml.
 * @private
 * @typedef {!goog.html.SafeHtml.StringLike_|!goog.html.SafeHtml}
 */
goog.html.SafeHtml.TextOrHtml_;


/**
 * Returns HTML-escaped text as a SafeHtml object.
 *
 * If text is of a type that implements
 * {@code goog.i18n.bidi.DirectionalString}, the directionality of the new
 * {@code SafeHtml} object is set to {@code text}'s directionality, if known.
 * Otherwise, the directionality of the resulting SafeHtml is unknown (i.e.,
 * {@code null}).
 *
 * @param {!goog.html.SafeHtml.StringLike_} text The string to escape.
 * @return {!goog.html.SafeHtml} The escaped string, wrapped as a SafeHtml.
 */
goog.html.SafeHtml.htmlEscape = function(text) {
  var dir = null;
  if (text.implementsGoogI18nBidiDirectionalString) {
    dir = text.getDirection();
  }
  var textAsString;
  if (text.implementsGoogStringTypedString) {
    textAsString = text.getTypedStringValue();
  } else {
    textAsString = String(text);
  }
  return goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse_(
      goog.string.htmlEscape(textAsString), dir);
};


/**
 * Returns HTML-escaped text as a SafeHtml object with newlines changed to <br>.
 * @param {!goog.html.SafeHtml.StringLike_} text The string to escape.
 * @return {!goog.html.SafeHtml} The escaped string, wrapped as a SafeHtml.
 */
goog.html.SafeHtml.htmlEscapePreservingNewlines = function(text) {
  var html = goog.html.SafeHtml.htmlEscape(text);
  return goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse_(
      goog.string.newLineToBr(goog.html.SafeHtml.unwrap(html)),
      html.getDirection());
};


/**
 * Coerces an arbitrary object into a SafeHtml object.
 *
 * If {@code textOrHtml} is already of type {@code goog.html.SafeHtml}, the same
 * object is returned. Otherwise, {@code textOrHtml} is coerced to string, and
 * HTML-escaped. If {@code textOrHtml} is of a type that implements
 * {@code goog.i18n.bidi.DirectionalString}, its directionality, if known, is
 * preserved.
 *
 * @param {!goog.html.SafeHtml.TextOrHtml_} textOrHtml The text or SafeHtml to
 *     coerce.
 * @return {!goog.html.SafeHtml} The resulting SafeHtml object.
 */
goog.html.SafeHtml.from = function(textOrHtml) {
  if (textOrHtml instanceof goog.html.SafeHtml) {
    return textOrHtml;
  } else if (textOrHtml.implementsGoogI18nBidiDirectionalString) {
    // Do not coerce to string, to preserve directionality.
    return goog.html.SafeHtml.htmlEscape(textOrHtml);
  } else if (textOrHtml.implementsGoogStringTypedString) {
    return goog.html.SafeHtml.htmlEscape(textOrHtml.getTypedStringValue());
  } else {
    return goog.html.SafeHtml.htmlEscape(String(textOrHtml));
  }
};


/**
 * @const
 * @private
 */
goog.html.SafeHtml.VALID_NAMES_IN_TAG_ = /^[a-zA-Z0-9-]+$/;


/**
 * Set of attributes containing URL as defined at
 * http://www.w3.org/TR/html5/index.html#attributes-1.
 * @const
 * @private
 */
goog.html.SafeHtml.URL_ATTRIBUTES_ = goog.object.createSet('action', 'cite',
    'data', 'formaction', 'href', 'manifest', 'poster', 'src');


// TODO(user): Perhaps add <template> used by Polymer?
/**
 * Set of tag names that are too dangerous.
 * @const
 * @private
 */
goog.html.SafeHtml.NOT_ALLOWED_TAG_NAMES_ = goog.object.createSet('link',
    'script', 'style');


/**
 * @private
 * @typedef {string|goog.string.Const|goog.html.SafeUrl|goog.html.SafeStyle}
 */
goog.html.SafeHtml.AttributeValue_;


/**
 * Creates a SafeHtml content consisting of a tag with optional attributes and
 * optional content.
 * @param {string} tagName The name of the tag. Only tag names consisting of
 *     [a-zA-Z0-9-] are allowed. <link>, <script> and <style> tags are not
 *     supported.
 * @param {!Object.<string, goog.html.SafeHtml.AttributeValue_>=}
 *     opt_attributes Mapping from attribute names to their values. Only
 *     attribute names consisting of [a-zA-Z0-9-] are allowed. Attributes with
 *     a special meaning (e.g. on*) require goog.string.Const value, attributes
 *     containing URL require goog.string.Const or goog.html.SafeUrl. Value of
 *     null or undefined causes the attribute to be omitted. Values are
 *     HTML-escaped before usage.
 * @param {!goog.html.SafeHtml.TextOrHtml_|
 *     !Array.<!goog.html.SafeHtml.TextOrHtml_>=} opt_content Content to put
 *     inside the tag. This must be empty for void tags like <br>. Array
 *     elements are concatenated.
 * @return {!goog.html.SafeHtml} The SafeHtml content with the tag.
 * @throws {Error} If invalid tag name, attribute name, or attribute value is
 *     provided.
 * @throws {goog.asserts.AssertionError} If content for void tag is provided.
 */
goog.html.SafeHtml.create = function(tagName, opt_attributes, opt_content) {
  if (!goog.html.SafeHtml.VALID_NAMES_IN_TAG_.test(tagName)) {
    throw Error('Invalid tag name <' + tagName + '>.');
  }
  if (tagName.toLowerCase() in goog.html.SafeHtml.NOT_ALLOWED_TAG_NAMES_) {
    throw Error('Tag name <' + tagName + '> is not allowed for SafeHtml.');
  }
  var dir = null;
  var result = '<' + tagName;

  if (opt_attributes) {
    for (var name in opt_attributes) {
      if (!goog.html.SafeHtml.VALID_NAMES_IN_TAG_.test(name)) {
        throw Error('Invalid attribute name "' + name + '".');
      }
      var value = opt_attributes[name];
      if (value == null) {
        continue;
      }
      if (value instanceof goog.string.Const) {
        // If it's goog.string.Const, allow any valid attribute name.
        value = goog.string.Const.unwrap(value);
      } else if (/^on/i.test(name)) {
        // TODO(user): Disallow more attributes with a special meaning.
        throw Error('Attribute "' + name +
            '" requires goog.string.Const value, "' + value + '" given.');
      } else if (value instanceof goog.html.SafeUrl) {
        // If it's goog.html.SafeUrl, allow any non-JavaScript attribute name.
        value = goog.html.SafeUrl.unwrap(value);
      } else if (name.toLowerCase() in goog.html.SafeHtml.URL_ATTRIBUTES_) {
        throw Error('Attribute "' + name +
            '" requires goog.string.Const or goog.html.SafeUrl value, "' +
            value + '" given.');
      } else if (value instanceof goog.html.SafeStyle) {
        // TODO(user): Allow "style" only with SafeStyle when it supports
        // dynamic construction.
        goog.asserts.assert(name.toLowerCase() == 'style',
            'goog.html.SafeStyle is only supported in "style" attribute.');
        value = goog.html.SafeStyle.unwrap(value);
      }
      result += ' ' + name + '="' + goog.string.htmlEscape(value) + '"';
    }
  }

  var content = opt_content;
  if (!goog.isDef(content)) {
    content = [];
  } else if (!goog.isArray(content)) {
    content = [content];
  }

  if (goog.dom.tags.isVoidTag(tagName.toLowerCase())) {
    goog.asserts.assert(!content.length,
        'Void tag <' + tagName + '> does not allow content.');
    result += '>';
  } else {
    var html = goog.html.SafeHtml.concat(content);
    result += '>' + goog.html.SafeHtml.unwrap(html) + '</' + tagName + '>';
    dir = html.getDirection();
  }

  var dirAttribute = opt_attributes && opt_attributes['dir'];
  if (dirAttribute) {
    if (dirAttribute.toLowerCase() == 'ltr') {
      dir = goog.i18n.bidi.Dir.LTR;
    } else if (dirAttribute.toLowerCase() == 'rtl') {
      dir = goog.i18n.bidi.Dir.RTL;
    } else {
      dir = null;
    }
  }

  return goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse_(
      result, dir);
};


/**
 * Creates a new SafeHtml object by concatenating the values.
 * @param {...!goog.html.SafeHtml.TextOrHtml_|
 *     !Array.<!goog.html.SafeHtml.TextOrHtml_>} var_args Elements of array
 *     arguments would be processed recursively.
 * @return {!goog.html.SafeHtml}
 */
goog.html.SafeHtml.concat = function(var_args) {
  var dir = goog.i18n.bidi.Dir.NEUTRAL;
  var content = '';

  /**
   * @param {!goog.html.SafeHtml.TextOrHtml_|
   *     !Array.<!goog.html.SafeHtml.TextOrHtml_>} argument
   */
  var addArgument = function(argument) {
    if (goog.isArray(argument)) {
      goog.array.forEach(argument, addArgument);
    } else {
      var html = goog.html.SafeHtml.from(argument);
      content += goog.html.SafeHtml.unwrap(html);
      var htmlDir = html.getDirection();
      if (dir == goog.i18n.bidi.Dir.NEUTRAL) {
        dir = htmlDir;
      } else if (htmlDir != goog.i18n.bidi.Dir.NEUTRAL && dir != htmlDir) {
        dir = null;
      }
    }
  };

  goog.array.forEach(arguments, addArgument);
  return goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse_(
      content, dir);
};


/**
 * Type marker for the SafeHtml type, used to implement additional run-time
 * type checking.
 * @const
 * @private
 */
goog.html.SafeHtml.TYPE_MARKER_GOOG_HTML_SECURITY_PRIVATE_ = {};


/**
 * Utility method to create SafeHtml instances.
 *
 * This function is considered "package private", i.e. calls (using "suppress
 * visibility") from other files within this package are considered acceptable.
 * DO NOT call this function from outside the goog.html package; use appropriate
 * wrappers instead.
 *
 * @param {string} html The string to initialize the SafeHtml object with.
 * @param {?goog.i18n.bidi.Dir} dir The directionality of the SafeHtml to be
 *     constructed, or null if unknown.
 * @return {!goog.html.SafeHtml} The initialized SafeHtml object.
 * @private
 */
goog.html.SafeHtml.createSafeHtmlSecurityPrivateDoNotAccessOrElse_ = function(
    html, dir) {
  var safeHtml = new goog.html.SafeHtml();
  safeHtml.privateDoNotAccessOrElseSafeHtmlWrappedValue_ = html;
  safeHtml.dir_ = dir;
  return safeHtml;
};


/**
 * A SafeHtml instance corresponding to the empty string.
 * @const {!goog.html.SafeHtml}
 */
goog.html.SafeHtml.EMPTY = goog.html.SafeHtml.htmlEscape('');
