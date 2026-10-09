/**
 * PersonalityRightsHelper.js
 * ---------------------------------------------------------------
 * Wikimedia Commons user script.
 *  - On any File: page, adds a coloured item to the Tools menu,
 *    right next to "What links here":
 *      GREEN  ✔ Personality rights      = template already present
 *      RED    ✚ Add Personality rights  = missing, click to add
 *  - One click inserts {{Personality rights}} on its own line
 *    just above  =={{int:license-header}}==
 *
 * Install: add this line to Special:MyPage/common.js
 *   mw.loader.load( '//commons.wikimedia.org/w/index.php?title=User:Manojk/PersonalityRightsHelper.js&action=raw&ctype=text/javascript' );
 *
 * Author: User:Manojk - Coordinator of Wiki Conference Kerala
 */
/* global mw, $ */
( function () {
	'use strict';

	// Run only on existing File: pages in normal view mode
	if (
		mw.config.get( 'wgNamespaceNumber' ) !== 6 ||
		mw.config.get( 'wgAction' ) !== 'view' ||
		mw.config.get( 'wgArticleId' ) === 0
	) {
		return;
	}

	var TEMPLATE = '{{Personality rights}}';
	var TEMPLATE_PAGE = 'Template:Personality rights';
	var SUMMARY = 'Adding ' + TEMPLATE + ' using [[User:Manojk/PersonalityRightsHelper.js|PersonalityRightsHelper]] #PersonalityRightsMatter';
	var title = mw.config.get( 'wgPageName' );

	// {{Personality rights}}, {{Personality right}}, {{Personalityrights}}, {{Personality}}, {{Template:Personality rights|...}}
	var TEMPLATE_RE = /\{\{\s*(?:template\s*:\s*)?personality(?:[ _-]?rights?)?\s*(?:\||\}\})/i;
	// == {{int:license-header}} ==  (spacing tolerant)
	var LICENSE_RE = /^[ \t]*==[ \t]*\{\{[ \t]*int:license-header[ \t]*\}\}[ \t]*==[ \t]*$/im;

	var STATES = {
		checking: { color: '#72777d', label: '⏳ Personality rights…', tip: 'Checking for ' + TEMPLATE },
		present: { color: '#14866d', label: '✔ Personality rights', tip: TEMPLATE + ' is present on this file' },
		missing: { color: '#d33', label: '✚ Add Personality rights', tip: 'Template missing — click to add ' + TEMPLATE + ' above the license header' },
		saving: { color: '#72777d', label: '⏳ Adding…', tip: 'Saving edit' },
		error: { color: '#ac6600', label: '⚠ Personality rights', tip: 'Could not check or edit — click to retry' }
	};

	mw.loader.using( [ 'mediawiki.api', 'mediawiki.util' ] ).then( function () {
		$( init );
	} );

	function init() {
		var api = new mw.Api();
		var state = 'checking';

		// Place the item right after "What links here" in the Tools menu
		var $wlh = $( '#t-whatlinkshere' );
		var nextNode = $wlh.length && $wlh.next().length ? $wlh.next()[ 0 ] : null;
		var li = mw.util.addPortletLink( 'p-tb', '#', STATES.checking.label, 't-personality-rights', STATES.checking.tip, null, nextNode );
		if ( !li ) {
			return;
		}
		var $link = $( li ).find( 'a' );
		var $label = $link.find( 'span' ).length ? $link.find( 'span' ).last() : $link;

		function setState( s, href, tip ) {
			state = s;
			var c = STATES[ s ];
			$label.text( c.label );
			$link.css( { color: c.color, fontWeight: s === 'missing' ? 'bold' : 'normal' } )
				.attr( 'title', tip || c.tip )
				.attr( 'href', href || '#' );
		}

		$link.on( 'click', function ( e ) {
			if ( state === 'missing' ) {
				e.preventDefault();
				addTemplate();
			} else if ( state === 'error' ) {
				e.preventDefault();
				check();
			} else if ( state === 'checking' || state === 'saving' ) {
				e.preventDefault();
			}
			// 'present': follow the link (template page or diff)
		} );

		function check() {
			setState( 'checking' );
			return api.get( {
				action: 'query',
				prop: 'templates|revisions',
				titles: title,
				tltemplates: TEMPLATE_PAGE, // catches redirects too
				tllimit: 1,
				rvprop: 'content',
				rvslots: 'main',
				formatversion: 2
			} ).then( function ( data ) {
				var page = data.query.pages[ 0 ];
				var text = page.revisions ? page.revisions[ 0 ].slots.main.content : '';
				var present = !!( page.templates && page.templates.length ) || TEMPLATE_RE.test( text );
				if ( present ) {
					setState( 'present', mw.util.getUrl( TEMPLATE_PAGE ) );
				} else if ( !mw.config.get( 'wgIsProbablyEditable' ) ) {
					setState( 'error', '#', TEMPLATE + ' missing, but you cannot edit this page' );
				} else {
					setState( 'missing' );
				}
			}, function ( code ) {
				setState( 'error', '#', 'Check failed (' + code + ') — click to retry' );
			} );
		}

		function addTemplate() {
			setState( 'saving' );
			api.edit( title, function ( revision ) {
				var text = revision.content;

				if ( TEMPLATE_RE.test( text ) ) {
					return $.Deferred().reject( 'already-present' ).promise();
				}

				var newText;
				if ( LICENSE_RE.test( text ) ) {
					// Put template on its own line, blank line, then the header
					newText = text.replace( LICENSE_RE, function ( header ) {
						return TEMPLATE + '\n\n' + header;
					} );
				} else {
					// eslint-disable-next-line no-alert
					if ( !window.confirm( 'No =={{int:license-header}}== found.\nAdd the template before the categories instead?' ) ) {
						return $.Deferred().reject( 'cancelled' ).promise();
					}
					var catIdx = text.search( /^\s*\[\[\s*Category\s*:/im );
					newText = catIdx === -1 ?
						text.replace( /\s*$/, '' ) + '\n\n' + TEMPLATE + '\n' :
						text.slice( 0, catIdx ).replace( /\s*$/, '' ) + '\n\n' + TEMPLATE + '\n\n' + text.slice( catIdx ).replace( /^\s*/, '' );
				}

				return { text: newText, summary: SUMMARY, nocreate: true };
			} ).then( function ( result ) {
				var diff = mw.util.getUrl( title, { diff: 'prev', oldid: result.newrevid } );
				setState( 'present', diff, 'Added — click to view the diff' );
				mw.notify( $( '<span>' ).append(
					'Added ' + TEMPLATE + '. ',
					$( '<a>' ).attr( 'href', diff ).text( 'View diff' ),
					' · ',
					$( '<a>' ).attr( 'href', '#' ).text( 'Reload' ).on( 'click', function ( e ) {
						e.preventDefault();
						location.reload();
					} )
				), { type: 'success' } );
			}, function ( code ) {
				if ( code === 'already-present' ) {
					setState( 'present', mw.util.getUrl( TEMPLATE_PAGE ) );
				} else if ( code === 'cancelled' ) {
					setState( 'missing' );
				} else {
					setState( 'error', '#', 'Edit failed (' + code + ') — click to retry' );
					mw.notify( 'Edit failed: ' + code, { type: 'error' } );
				}
			} );
		}

		check();
	}
}() );
