(function() {
    var IMAGE_EXTENSIONS = ['webp', 'png', 'jpg', 'jpeg', 'avif'];
    var CARD_BASE_NAMES = ['PRODUCT MAIN IMAGE 1', 'card', 'main', 'cover', 'detail-1'];
    var GALLERY_BASE_NAMES = [
        ['PRODUCT MAIN IMAGE 1', 'detail-1', 'gallery-1', 'main'],
        ['PRODUCT MAIN IMAGE 2', 'detail-2', 'gallery-2'],
        ['PRODUCT MAIN IMAGE 3', 'detail-3', 'gallery-3'],
        ['PRODUCT MAIN IMAGE 4', 'detail-4', 'gallery-4']
    ];
    var CATEGORY_NAMES = {
        strollers: { en: 'Stroller', th: 'รถเข็นเด็ก', zh: '婴儿推车' },
        carseats: { en: 'Car Seat', th: 'เบาะนั่งรถ', zh: '安全座椅' },
        carriers: { en: 'Carrier', th: 'สายรัด', zh: '婴儿背带' },
        walkers: { en: 'Baby Walker', th: 'รถเดินเด็ก', zh: '学步车' },
        outdoor: { en: 'Outdoor', th: 'กิจกรรมกลางแจ้ง', zh: '儿童外出' },
        mombags: { en: 'Mom Bag', th: 'กระเป๋าแม่', zh: '妈咪袋' }
    };
    var lightboxState = {
        currentIndex: 0,
        productId: null,
        slots: []
    };
    var imageProbeCache = {};
    var detailEventsBound = false;

    function getCurrentLang() {
        if (typeof window.getCurrentLang === 'function') {
            try {
                return window.getCurrentLang();
            } catch (error) {
                // Ignore and use fallback below.
            }
        }
        return localStorage.getItem('beige-language') || 'en';
    }

    function getI18nText(lang, key, fallback) {
        if (typeof i18n !== 'undefined' && i18n[lang] && i18n[lang][key]) {
            return i18n[lang][key];
        }
        return fallback || '';
    }

    function localizeAgeRange(value, lang) {
        var text = String(value || '').trim();

        if (!text) return '';
        if (lang === 'zh') return text;

        if (lang === 'th') {
            return text
                .replace(/个月/g, ' เดือน')
                .replace(/岁/g, ' ปี')
                .replace(/年/g, ' ปี');
        }

        return text
            .replace(/个月/g, ' months')
            .replace(/岁/g, ' years')
            .replace(/年/g, ' years');
    }

    function localizeCapacity(value, lang) {
        var text = String(value || '').trim();

        if (!text) return '';
        if (lang === 'zh') return text;
        if (lang === 'th') {
            return text.replace(/kg/ig, 'กก.');
        }
        return text;
    }

    function setTextById(id, value) {
        var node = document.getElementById(id);
        if (node) {
            node.textContent = value;
        }
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function toArray(value) {
        if (!value) return [];
        return Array.isArray(value) ? value.slice() : [value];
    }

    function getProductRecord(productId) {
        var i;
        if (window.productData && window.productData[String(productId)]) {
            return window.productData[String(productId)];
        }
        if (window.products) {
            for (i = 0; i < window.products.length; i++) {
                if (String(window.products[i].id) === String(productId)) {
                    return window.products[i];
                }
            }
        }
        return null;
    }

    function unique(list) {
        var seen = {};
        var result = [];
        for (var i = 0; i < list.length; i++) {
            if (!seen[list[i]]) {
                seen[list[i]] = true;
                result.push(list[i]);
            }
        }
        return result;
    }

    function getProductNames(product) {
        if (!product) {
            return { zh: '', en: '', th: '' };
        }

        if (product.name && typeof product.name === 'object') {
            return {
                zh: product.name.zh || '',
                en: product.name.en || '',
                th: product.name.th || ''
            };
        }

        return {
            zh: product.name || '',
            en: product.nameEn || '',
            th: product.nameTh || ''
        };
    }

    function getNameVariants(value) {
        var trimmed = String(value || '').trim();
        var compact;
        var hyphenated;

        if (!trimmed) return [];

        compact = trimmed.replace(/\s+/g, '');
        hyphenated = trimmed.replace(/\s+/g, '-');

        return unique([trimmed, compact, hyphenated]);
    }

    function getFolderCandidates(productId, product) {
        var names = getProductNames(product);
        var folders = ['images/products/' + productId];
        var variants = []
            .concat(getNameVariants(names.zh))
            .concat(getNameVariants(names.en))
            .concat(getNameVariants(names.th));
        var mappedName = window.PRODUCT_IMAGE_FOLDERS ? window.PRODUCT_IMAGE_FOLDERS[String(productId)] : '';

        if (mappedName) {
            folders.unshift('images/products/' + productId + '-' + mappedName);
        }

        for (var i = 0; i < variants.length; i++) {
            folders.push('images/products/' + productId + '-' + variants[i]);
        }

        return unique(folders);
    }

    function getPreferredFolder(productId, product) {
        var mappedName = window.PRODUCT_IMAGE_FOLDERS ? window.PRODUCT_IMAGE_FOLDERS[String(productId)] : '';
        var names = getProductNames(product);
        var zhVariants = getNameVariants(names.zh);
        var enVariants = getNameVariants(names.en);

        if (mappedName) return 'images/products/' + productId + '-' + mappedName;
        if (zhVariants.length > 1) return 'images/products/' + productId + '-' + zhVariants[1];
        if (zhVariants.length) return 'images/products/' + productId + '-' + zhVariants[0];
        if (enVariants.length > 1) return 'images/products/' + productId + '-' + enVariants[1];
        if (enVariants.length) return 'images/products/' + productId + '-' + enVariants[0];
        return 'images/products/' + productId;
    }

    function getProductDisplayName(product, lang) {
        if (!product) return '';
        if (product.name && typeof product.name === 'object') {
            return product.name[lang] || product.name.en || '';
        }
        if (lang === 'zh') return product.name || product.nameEn || '';
        if (lang === 'th') return product.nameTh || product.nameEn || product.name || '';
        return product.nameEn || product.name || '';
    }

    function getProductHighlights(product, lang) {
        if (!product) return '';
        if (product.highlights && typeof product.highlights === 'object') {
            return product.highlights[lang] || product.highlights.en || '';
        }
        if (lang === 'zh') return product.highlights || '';
        if (lang === 'th') return product.highlightsTh || product.highlightsEn || product.highlights || '';
        return product.highlightsEn || product.highlights || '';
    }

    function getCategoryLabel(category, lang) {
        if (!CATEGORY_NAMES[category]) return category || '';
        return CATEGORY_NAMES[category][lang] || CATEGORY_NAMES[category].en;
    }

    function getImageOverrides(productId) {
        if (!window.PRODUCT_IMAGE_OVERRIDES) return {};
        return window.PRODUCT_IMAGE_OVERRIDES[String(productId)] || {};
    }

    function buildUrls(productId, names, product) {
        var folders = getFolderCandidates(productId, product);
        var urls = [];
        var values = toArray(names);

        for (var i = 0; i < values.length; i++) {
            var entry = values[i];
            if (!entry || typeof entry !== 'string') continue;

            if (/^(?:https?:)?\/\//.test(entry) || entry.indexOf('data:') === 0) {
                urls.push(entry);
                continue;
            }

            if (/\.(avif|webp|png|jpe?g)$/i.test(entry)) {
                if (entry.indexOf('/') === -1) {
                    for (var j = 0; j < folders.length; j++) {
                        urls.push(encodeURI(folders[j] + '/' + entry));
                    }
                } else {
                    urls.push(encodeURI(entry));
                }
                continue;
            }

            if (entry.indexOf('/') !== -1) {
                for (var k = 0; k < IMAGE_EXTENSIONS.length; k++) {
                    urls.push(encodeURI(entry + '.' + IMAGE_EXTENSIONS[k]));
                }
                continue;
            }

            for (var m = 0; m < folders.length; m++) {
                for (var n = 0; n < IMAGE_EXTENSIONS.length; n++) {
                    urls.push(encodeURI(folders[m] + '/' + entry + '.' + IMAGE_EXTENSIONS[n]));
                }
            }
        }

        return unique(urls);
    }

    function getCardCandidates(productId, product) {
        var overrides = getImageOverrides(productId);
        if (overrides.card) return buildUrls(productId, overrides.card, product);
        return buildUrls(productId, CARD_BASE_NAMES, product);
    }

    function getGallerySlot(productId, index, productName, product) {
        var slotName = 'detail-' + (index + 1);
        var overrides = getImageOverrides(productId);
        var sourceNames = overrides.gallery && overrides.gallery[index] ? overrides.gallery[index] : GALLERY_BASE_NAMES[index];
        return {
            index: index,
            key: slotName,
            label: productName ? productName + ' / PRODUCT MAIN IMAGE ' + (index + 1) : ('PRODUCT MAIN IMAGE ' + (index + 1)),
            hint: getPreferredFolder(productId, product) + '/PRODUCT MAIN IMAGE ' + (index + 1) + '.png',
            isPortrait: index === 3,
            candidates: buildUrls(productId, sourceNames, product)
        };
    }

    function probeImage(url) {
        if (imageProbeCache[url]) return imageProbeCache[url];
        imageProbeCache[url] = new Promise(function(resolve) {
            var image = new Image();
            image.onload = function() {
                resolve(url);
            };
            image.onerror = function() {
                resolve('');
            };
            image.src = url;
        });
        return imageProbeCache[url];
    }

    function resolveFirst(candidates) {
        var key = candidates.join('|');
        if (!key) return Promise.resolve('');
        if (imageProbeCache[key]) return imageProbeCache[key];

        imageProbeCache[key] = new Promise(function(resolve) {
            function tryNext(index) {
                if (index >= candidates.length) {
                    resolve('');
                    return;
                }
                probeImage(candidates[index]).then(function(result) {
                    if (result) {
                        resolve(result);
                        return;
                    }
                    tryNext(index + 1);
                });
            }

            tryNext(0);
        });

        return imageProbeCache[key];
    }

    function setPlaceholderText(placeholder, title, hint) {
        if (!placeholder) return;
        var titleNode = placeholder.querySelector('span');
        var hintNode = placeholder.querySelector('small');
        if (titleNode && title) titleNode.textContent = title;
        if (hintNode && hint) hintNode.textContent = hint;
    }

    function setImageState(options) {
        var image = options.image;
        var placeholder = options.placeholder;
        var src = options.src;

        if (!image || !placeholder) return;

        if (src) {
            image.src = src;
            image.alt = options.alt || '';
            image.style.display = 'block';
            placeholder.classList.add('has-image');
        } else {
            image.removeAttribute('src');
            image.style.display = 'none';
            placeholder.classList.remove('has-image');
        }

        if (options.portrait) {
            placeholder.classList.add('img-portrait');
        } else {
            placeholder.classList.remove('img-portrait');
        }
    }

    function mountResolvedImage(productId, image, placeholder, candidates, meta) {
        if (!image || !placeholder) return Promise.resolve('');

        var requestId = String(Date.now()) + Math.random();
        image.setAttribute('data-request-id', requestId);
        setPlaceholderText(placeholder, meta.label, meta.hint);

        return resolveFirst(candidates).then(function(src) {
            if (image.getAttribute('data-request-id') !== requestId) return src;
            setImageState({
                image: image,
                placeholder: placeholder,
                src: src,
                alt: meta.alt,
                portrait: meta.portrait
            });
            return src;
        });
    }

    function getCardMeta(productId, productName, product) {
        return {
            label: productName || ('Product ' + productId),
            hint: getPreferredFolder(productId, product) + '/PRODUCT MAIN IMAGE 1.png',
            alt: productName || ('Product ' + productId),
            portrait: false
        };
    }

    function renderCollectionCardImages() {
        var cards = document.querySelectorAll('.product-card[data-product-id]');
        for (var i = 0; i < cards.length; i++) {
            var card = cards[i];
            var productId = card.getAttribute('data-product-id');
            var productName = card.getAttribute('data-product-name') || ('Product ' + productId);
            var product = getProductRecord(productId);
            var image = card.querySelector('.product-card-img');
            var placeholder = card.querySelector('.product-image .image-placeholder');
            mountResolvedImage(productId, image, placeholder, getCardCandidates(productId, product), getCardMeta(productId, productName, product));
        }
    }

    function buildProductCard(product) {
        var lang = getCurrentLang();
        var highlights = getProductHighlights(product, lang).split('+');
        var categoryLabel = getCategoryLabel(product.category, lang);
        var name = getProductDisplayName(product, lang);
        var viewDetailLabel = lang === 'zh' ? '查看详情' : (lang === 'th' ? 'ดูรายละเอียด' : 'View Details');
        var features = '<ul class="product-features">';

        for (var i = 0; i < highlights.length && i < 4; i++) {
            features += '<li>' + escapeHtml(highlights[i].trim()) + '</li>';
        }
        features += '</ul>';

        return ''
            + '<div class="product-card" data-category="' + escapeHtml(product.category) + '" data-product-id="' + escapeHtml(product.id) + '" data-product-name="' + escapeHtml(name) + '">'
            + '  <div class="product-image">'
            + '    <img class="product-card-img" src="" alt="' + escapeHtml(name) + '" loading="lazy" decoding="async" style="display:none;">'
            + '    <div class="image-placeholder">'
            + '      <span>' + escapeHtml(name) + '</span>'
            + '      <small>' + escapeHtml(getCardMeta(product.id, name, product).hint) + '</small>'
            + '    </div>'
            + '  </div>'
            + '  <div class="product-info">'
            + '    <span class="product-category">' + escapeHtml(categoryLabel) + '</span>'
            + '    <h3>' + escapeHtml(name) + '</h3>'
            +      features
            + '    <div class="product-actions"><a href="product-detail.html?id=' + encodeURIComponent(product.id) + '" class="btn btn-outline">' + escapeHtml(viewDetailLabel) + '</a></div>'
            + '  </div>'
            + '</div>';
    }

    function enhanceCollectionsPage() {
        if (!window.products || !document.getElementById('productsGrid')) return;

        window.createProductCard = buildProductCard;
        window.renderProducts = function() {
            var grid = document.getElementById('productsGrid');
            var pagination = document.getElementById('pagination');
            var data;
            var html = '';

            if (!grid || typeof window.getPaginatedProducts !== 'function') return;

            data = window.getPaginatedProducts();
            for (var i = 0; i < data.products.length; i++) {
                html += window.createProductCard(data.products[i]);
            }

            grid.innerHTML = html;
            renderCollectionCardImages();

            if (pagination && typeof window.createPaginationHTML === 'function') {
                pagination.innerHTML = window.createPaginationHTML(data.totalPages);
            }
        };
    }

    function getDetailDom() {
        return {
            mainPlaceholder: document.getElementById('mainImagePlaceholder'),
            mainImage: document.getElementById('mainImage'),
            mainText: document.getElementById('mainImageText'),
            galleryDots: document.querySelectorAll('#galleryIndicator .indicator-dot'),
            lightbox: document.getElementById('lightboxModal'),
            lightboxPlaceholder: document.getElementById('lightboxPlaceholder'),
            lightboxText: document.getElementById('lightboxText'),
            lightboxImage: document.getElementById('lightboxImage'),
            lightboxDots: document.getElementById('lightboxDots')
        };
    }

    function refreshIndicatorDots(currentIndex) {
        var dom = getDetailDom();
        for (var i = 0; i < dom.galleryDots.length; i++) {
            dom.galleryDots[i].classList.toggle('active', i === currentIndex);
        }
    }

    function refreshLightboxDots(currentIndex) {
        var dom = getDetailDom();
        if (!dom.lightboxDots) return;
        var dots = dom.lightboxDots.querySelectorAll('.dot');
        for (var i = 0; i < dots.length; i++) {
            dots[i].classList.toggle('active', i === currentIndex);
        }
    }

    function buildLightboxDots() {
        var dom = getDetailDom();
        if (!dom.lightboxDots) return;

        dom.lightboxDots.innerHTML = '';
        for (var i = 0; i < lightboxState.slots.length; i++) {
            (function(index) {
                var dot = document.createElement('span');
                dot.className = 'dot' + (index === lightboxState.currentIndex ? ' active' : '');
                dot.addEventListener('click', function() {
                    updateGallery(index);
                });
                dom.lightboxDots.appendChild(dot);
            }(i));
        }
    }

    function updateLightbox() {
        var dom = getDetailDom();
        var slot = lightboxState.slots[lightboxState.currentIndex];

        if (!dom.lightbox || !slot) return;

        setPlaceholderText(dom.lightboxPlaceholder, slot.label, '');
        setImageState({
            image: dom.lightboxImage,
            placeholder: dom.lightboxPlaceholder,
            src: slot.src,
            alt: slot.label,
            portrait: slot.isPortrait
        });

        if (dom.lightboxText) {
            dom.lightboxText.textContent = slot.src ? '' : slot.label;
        }

        refreshLightboxDots(lightboxState.currentIndex);
    }

    function openLightbox() {
        var dom = getDetailDom();
        if (!dom.lightbox || !lightboxState.slots.length) return;
        buildLightboxDots();
        updateLightbox();
        dom.lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        var dom = getDetailDom();
        if (!dom.lightbox) return;
        dom.lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function updateGallery(index) {
        var dom = getDetailDom();

        if (!lightboxState.slots.length || !dom.mainPlaceholder) return;

        if (index < 0) index = lightboxState.slots.length - 1;
        if (index >= lightboxState.slots.length) index = 0;

        lightboxState.currentIndex = index;

        var slot = lightboxState.slots[index];
        setPlaceholderText(dom.mainPlaceholder, slot.label, slot.hint);
        setImageState({
            image: dom.mainImage,
            placeholder: dom.mainPlaceholder,
            src: slot.src,
            alt: slot.label,
            portrait: slot.isPortrait
        });

        if (dom.mainText) {
            dom.mainText.textContent = slot.src ? '' : slot.label;
        }

        refreshIndicatorDots(index);
        updateLightbox();
    }

    function setGallerySlots(productId, product) {
        var name = getProductDisplayName(product, getCurrentLang()) || ('Product ' + productId);
        var slots = [];

        lightboxState.productId = String(productId);
        lightboxState.currentIndex = 0;

        for (var i = 0; i < 4; i++) {
            slots.push(getGallerySlot(productId, i, name, product));
        }

        lightboxState.slots = slots;
        updateGallery(0);

        Promise.all(slots.map(function(slot) {
            return resolveFirst(slot.candidates).then(function(src) {
                slot.src = src;
                return slot;
            });
        })).then(function(resolvedSlots) {
            if (lightboxState.productId !== String(productId)) return;
            lightboxState.slots = resolvedSlots;
            updateGallery(lightboxState.currentIndex || 0);
        });
    }

    function parseSpecs(specText) {
        if (typeof window.parseSpecs === 'function') {
            return window.parseSpecs(specText);
        }
        var parts = (specText || '').split('|');
        return {
            dimensions: parts[0] ? parts[0].trim() : '',
            weight: parts[1] ? parts[1].trim() : ''
        };
    }

    function renderRelatedProducts(productId, product) {
        var grid = document.getElementById('relatedGrid');
        var lang = getCurrentLang();
        var viewDetailLabel = lang === 'zh' ? '查看详情' : (lang === 'th' ? 'ดูรายละเอียด' : 'View Details');
        var ids;
        var sameCategory = [];
        var fallback = [];
        var html = '';
        var i;

        if (!grid || !window.productData) return;

        ids = Object.keys(window.productData).sort(function(a, b) {
            return Number(a) - Number(b);
        });

        for (i = 0; i < ids.length; i++) {
            var id = ids[i];
            if (String(id) === String(productId)) continue;
            if (window.productData[id].category === product.category) {
                sameCategory.push(id);
            } else {
                fallback.push(id);
            }
        }

        ids = sameCategory.slice(0, 2);
        while (ids.length < 2 && fallback.length) {
            ids.push(fallback.shift());
        }

        for (i = 0; i < ids.length; i++) {
            var relatedId = ids[i];
            var relatedProduct = window.productData[relatedId];
            var name = getProductDisplayName(relatedProduct, lang);
            var hint = getCardMeta(relatedId, name, relatedProduct).hint;

            html += ''
                + '<div class="related-card" data-product-id="' + escapeHtml(relatedId) + '" data-product-name="' + escapeHtml(name) + '">'
                + '  <div class="related-card-media">'
                + '    <img class="related-card-img" src="" alt="' + escapeHtml(name) + '" loading="lazy" decoding="async" style="display:none;">'
                + '    <div class="image-placeholder">'
                + '      <span>' + escapeHtml(name) + '</span>'
                + '      <small>' + escapeHtml(hint) + '</small>'
                + '    </div>'
                + '  </div>'
                + '  <h4>' + escapeHtml(name) + '</h4>'
                + '  <a href="product-detail.html?id=' + encodeURIComponent(relatedId) + '" class="btn btn-text">' + escapeHtml(viewDetailLabel) + '</a>'
                + '</div>';
        }

        grid.innerHTML = html;

        var cards = grid.querySelectorAll('.related-card');
        for (i = 0; i < cards.length; i++) {
            var card = cards[i];
            var image = card.querySelector('.related-card-img');
            var placeholder = card.querySelector('.image-placeholder');
            var relatedName = card.getAttribute('data-product-name');
            var relatedProductId = card.getAttribute('data-product-id');
            mountResolvedImage(
                relatedProductId,
                image,
                placeholder,
                getCardCandidates(relatedProductId, window.productData[relatedProductId]),
                getCardMeta(relatedProductId, relatedName, window.productData[relatedProductId])
            );
        }
    }

    function enhanceProductDetailPage() {
        if (!window.productData || !document.getElementById('productName')) return;

        window.loadProductDetail = function(productId) {
            var product = window.productData[productId];
            var lang;
            var categoryElement;
            var highlights;
            var highlightNodes;
            var specs;
            var specInfo;
            var featureIds = ['feature-0', 'feature-1', 'feature-2', 'feature-3', 'feature-4'];
            var i;

            if (!product) {
                document.getElementById('productName').textContent = 'Product not found';
                return;
            }

            lang = getCurrentLang();
            categoryElement = document.getElementById('productCategory');
            if (categoryElement) {
                categoryElement.textContent = getCategoryLabel(product.category, lang);
            }

            document.getElementById('productName').textContent = getProductDisplayName(product, lang);
            document.getElementById('productTagline').textContent = product.tagline[lang] || product.tagline.en || '';

            highlights = getProductHighlights(product, lang).split('+');
            highlightNodes = document.querySelectorAll('#productHighlights .highlight-text');
            for (i = 0; i < highlightNodes.length; i++) {
                highlightNodes[i].textContent = highlights[i] ? highlights[i].trim() : '';
            }

            specs = product.specs[lang] || product.specs.en || '';
            specInfo = parseSpecs(specs);

            setTextById('specsTitle', getI18nText(lang, 'product.specsTitle', 'Specifications'));
            setTextById('specDimensionsLabel', getI18nText(lang, 'product.spec.dimensions', 'Dimensions'));
            setTextById('specWeightLabel', getI18nText(lang, 'product.spec.weight', 'Weight'));
            setTextById('specAgeLabel', getI18nText(lang, 'product.spec.age', 'Age Range'));
            setTextById('specCapacityLabel', getI18nText(lang, 'product.spec.capacity', 'Weight Capacity'));

            setTextById('specDimensions', specInfo.dimensions);
            setTextById('specWeight', specInfo.weight);
            setTextById('specAge', localizeAgeRange(product.age || '', lang));
            setTextById('specCapacity', localizeCapacity(product.maxWeight || '', lang));

            for (i = 0; i < featureIds.length; i++) {
                var featureNode = document.getElementById(featureIds[i]);
                if (featureNode) featureNode.textContent = highlights[i] ? highlights[i].trim() : '';
            }

            if (document.getElementById('buyBtn') && product.buyLink) {
                document.getElementById('buyBtn').href = product.buyLink;
            }

            if (document.getElementById('tiktokBtn')) {
                if (product.tiktokLink) {
                    document.getElementById('tiktokBtn').style.display = '';
                    document.getElementById('tiktokBtn').href = product.tiktokLink;
                } else {
                    document.getElementById('tiktokBtn').style.display = 'none';
                }
            }

            if (document.getElementById('tiktok-coupon-block')) {
                if (product.tiktokLink) {
                    var couponCode = window.PRODUCT_TIKTOK_COUPONS ? window.PRODUCT_TIKTOK_COUPONS[productId] : null;
                    document.getElementById('tiktok-coupon-block').style.display = '';
                    if (couponCode && document.getElementById('tiktok-coupon-code')) {
                        document.getElementById('tiktok-coupon-code').textContent = couponCode;
                    }
                } else {
                    document.getElementById('tiktok-coupon-block').style.display = 'none';
                }
            }

            setGallerySlots(productId, product);
            renderRelatedProducts(productId, product);
            document.title = getProductDisplayName(product, lang) + ' | beige Premium Baby Travel';
        };
    }

    function initDetailInteractions() {
        var prevButton = document.getElementById('galleryPrev');
        var nextButton = document.getElementById('galleryNext');
        var mainImage = document.querySelector('.main-image');
        var lightbox = document.getElementById('lightboxModal');
        var lightboxClose = document.getElementById('lightboxClose');
        var lightboxPrev = document.getElementById('lightboxPrev');
        var lightboxNext = document.getElementById('lightboxNext');
        var dots = document.querySelectorAll('#galleryIndicator .indicator-dot');

        if (detailEventsBound || !prevButton || !nextButton) return;
        detailEventsBound = true;

        prevButton.addEventListener('click', function() {
            updateGallery(lightboxState.currentIndex - 1);
        });

        nextButton.addEventListener('click', function() {
            updateGallery(lightboxState.currentIndex + 1);
        });

        for (var i = 0; i < dots.length; i++) {
            (function(index) {
                dots[index].addEventListener('click', function() {
                    updateGallery(index);
                });
            }(i));
        }

        if (mainImage) {
            mainImage.addEventListener('click', function(event) {
                if (event.target.closest('.gallery-btn')) return;
                openLightbox();
            });
        }

        if (lightbox) {
            lightbox.addEventListener('click', function(event) {
                if (event.target === lightbox) closeLightbox();
            });
        }

        if (lightboxClose) {
            lightboxClose.addEventListener('click', closeLightbox);
        }

        if (lightboxPrev) {
            lightboxPrev.addEventListener('click', function() {
                updateGallery(lightboxState.currentIndex - 1);
            });
        }

        if (lightboxNext) {
            lightboxNext.addEventListener('click', function() {
                updateGallery(lightboxState.currentIndex + 1);
            });
        }
    }

    enhanceCollectionsPage();
    enhanceProductDetailPage();

    document.addEventListener('DOMContentLoaded', function() {
        initDetailInteractions();
    });

    window.ProductMedia = {
        getCardCandidates: getCardCandidates,
        getGallerySlot: getGallerySlot,
        renderCollectionCardImages: renderCollectionCardImages,
        updateGallery: updateGallery
    };
    window.updateGallery = updateGallery;
}());
