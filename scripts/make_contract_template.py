"""Build the promise-of-sale Word template (RTL, placeholders in single runs, watermark, page X of Y)."""
import zipfile, os, sys
from xml.sax.saxutils import escape

OUT = sys.argv[1] if len(sys.argv) > 1 else "promise_template.docx"
FONT = "Segoe UI"
NAVY, GOLD, SOFT = "111111", "BFBFBF", None
LINE, HEADFILL = "D0D0D0", "F2F2F2"
RLM = "‏"
BODY, SMALL, HEAD, TITLE = 21, 17, 22, 36  # half-points

def rpr(b=False, sz=BODY, color=None, rtl=True):
    return ("<w:rPr>" + f'<w:rFonts w:ascii="{FONT}" w:hAnsi="{FONT}" w:cs="{FONT}" w:eastAsia="{FONT}"/>'
            + ("<w:b/><w:bCs/>" if b else "") + (f'<w:color w:val="{color}"/>' if color else "")
            + f'<w:sz w:val="{sz}"/><w:szCs w:val="{sz}"/>' + ("<w:rtl/>" if rtl else "") + "</w:rPr>")

def R(text, b=False, sz=BODY, color=None):
    """Arabic text run (right-to-left)."""
    return f'<w:r>{rpr(b, sz, color)}<w:t xml:space="preserve">{escape(text)}</w:t></w:r>'

def V(key, b=False, sz=BODY, color=None):
    """A filled-in value. Not marked RTL, so English (project names, unit codes) keeps its own order;
    the RLM after it keeps the brackets / commas that follow on the Arabic side."""
    return (f'<w:r>{rpr(b, sz, color, rtl=False)}<w:t xml:space="preserve">{{{{{key}}}}}</w:t></w:r>'
            + f'<w:r>{rpr(b, sz, color)}<w:t xml:space="preserve">{RLM}</w:t></w:r>')

def P(*runs, jc="both", before=0, after=60, line=300, keep=False, border=None, shade=None, ind=None):
    ppr = "<w:pPr>" + ("<w:keepNext/>" if keep else "")
    if border: ppr += f'<w:pBdr><w:bottom w:val="single" w:sz="8" w:space="2" w:color="{border}"/></w:pBdr>'
    if shade: ppr += f'<w:shd w:val="clear" w:color="auto" w:fill="{shade}"/>'
    ppr += f'<w:bidi/><w:spacing w:before="{before}" w:after="{after}" w:line="{line}" w:lineRule="auto"/>'
    if ind: ppr += f'<w:ind w:right="{ind}"/>'
    ppr += f'<w:jc w:val="{jc}"/>' + rpr() + "</w:pPr>"
    return f"<w:p>{ppr}{''.join(runs)}</w:p>"

def heading(text):
    return P(R(text, b=True, sz=HEAD, color="000000"), jc="center", before=140, after=40, keep=True)

def cell(content, w, fill=None, span=None, valign="center"):
    tcpr = f'<w:tcPr><w:tcW w:w="{w}" w:type="dxa"/>' + (f'<w:gridSpan w:val="{span}"/>' if span else "")
    tcpr += (f'<w:shd w:val="clear" w:color="auto" w:fill="{fill}"/>' if fill else "") + f'<w:vAlign w:val="{valign}"/></w:tcPr>'
    return f"<w:tc>{tcpr}{content}</w:tc>"

def table(widths, rows, borders=True):
    b = (f'<w:tblBorders><w:top w:val="single" w:sz="8" w:color="000000"/><w:left w:val="nil"/>'
         f'<w:bottom w:val="single" w:sz="8" w:color="000000"/><w:right w:val="nil"/>'
         f'<w:insideH w:val="single" w:sz="4" w:color="{LINE}"/><w:insideV w:val="nil"/></w:tblBorders>') if borders else \
        '<w:tblBorders><w:top w:val="nil"/><w:left w:val="nil"/><w:bottom w:val="nil"/><w:right w:val="nil"/><w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders>'
    tpr = (f'<w:tblPr><w:bidiVisual/><w:tblW w:w="{sum(widths)}" w:type="dxa"/><w:jc w:val="center"/>{b}'
           '<w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="40" w:type="dxa"/><w:left w:w="80" w:type="dxa"/>'
           '<w:bottom w:w="40" w:type="dxa"/><w:right w:w="80" w:type="dxa"/></w:tblCellMar><w:tblLook w:val="0000"/></w:tblPr>')
    grid = "<w:tblGrid>" + "".join(f'<w:gridCol w:w="{w}"/>' for w in widths) + "</w:tblGrid>"
    return f"<w:tbl>{tpr}{grid}{''.join(rows)}</w:tbl>"

def row(cells, header=False, cant_split=True):
    trpr = "<w:trPr>" + ("<w:cantSplit/>" if cant_split else "") + ("<w:tblHeader/>" if header else "") + "</w:trPr>"
    return f"<w:tr>{trpr}{''.join(cells)}</w:tr>"

KEEP = [False]
def cp(*runs, jc="start", after=0):
    return P(*runs, jc=jc, after=after, line=252, keep=KEEP[0])

W = 9638  # text width (A4, 2 cm margins) in twips
body = []

# ---------- Title ----------
lg_w, lg_h = 1008000, 671300
body.append(P('<w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="%d" cy="%d"/>' % (lg_w, lg_h) +
              '<wp:docPr id="1" name="Logo"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">'
              '<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">'
              '<pic:nvPicPr><pic:cNvPr id="1" name="logo.png"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rIdLogo"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>'
              '<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="%d" cy="%d"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r>' % (lg_w, lg_h),
              jc="center", after=0))
body.append(P(R("عقد وعد بالبيع", b=True, sz=TITLE), jc="center", after=0, line=240))
body.append(P(R("حُرر في يوم ", sz=SMALL, color="555555"), V("DAY", sz=SMALL, color="555555"), R(" الموافق ", sz=SMALL, color="555555"), V("DATE", sz=SMALL, color="555555"), jc="center", after=120))

KEEP[0] = True
lab = lambda t: R(t, sz=SMALL, color="666666")
# ---------- Parties ----------
body.append(heading("أطراف العقد"))
half = W // 2
def party_cell(title, n, i, a):
    return cell(cp(R(title, b=True)) + cp(lab("الاسم: "), V(n)) + cp(lab("الرقم القومي: "), V(i)) + cp(lab("العنوان: "), V(a)), half, valign="top")
body.append(table([half, half], [row([party_cell("الطرف الأول (البائع)", "S_NAME", "S_ID", "S_ADDR"), party_cell("الطرف الثاني (المشتري)", "B_NAME", "B_ID", "B_ADDR")])]))

# ---------- Unit ----------
body.append(heading("الوحدة"))
lw, vw = 2000, W - 2000
def kv(label, *runs, cond=None):
    extra = [V(cond, sz=2)] if cond else []
    return row([cell(cp(lab(label)), lw), cell(cp(*runs, *extra), vw)])
body.append(table([lw, vw], [
    kv("المشروع", V("PROJECT"), R(" – "), V("DEVELOPER")),
    kv("رقم الوحدة", V("UNIT")),
    kv("الوصف", V("UNIT_DESC")),
    kv("المساحة", V("AREA"), R(" م² تقريباً (تحت العجز والزيادة)")),
    kv("الحديقة", V("GARDEN_AREA"), R(" م² – حق انتفاع ملحق بالوحدة"), cond="IF_GARDEN"),
]))

# ---------- Money ----------
body.append(heading("الثمن"))
c1, c2 = 3200, W - 3200
def money_row(label, key, cond=None, strong=False, fill=None):
    amt = [V(key, b=True), R(" جنيه", b=True), R("  —  ", sz=SMALL, color="888888"), V(key + "_W", sz=SMALL, color="444444")]
    if cond: amt.append(V(cond, sz=2))
    return row([cell(cp(R(label, b=strong) if strong else lab(label)), c1, fill=fill), cell(cp(*amt), c2, fill=fill)])
body.append(table([c1, c2], [
    money_row("إجمالي المبالغ", "TOTAL", strong=True, fill=HEADFILL),
    row([cell(cp(R("ويُسدد على النحو التالي:", sz=SMALL, color="666666")), c1 + c2, span=2)]),
    money_row("المقدم (للبائع)", "ADVANCE"),
    money_row("الأقساط المتبقية للشركة المطورة", "DEV", cond="IF_DEV"),
    money_row("مصاريف / وديعة الصيانة", "MAINT", cond="IF_MAINT"),
    money_row("اشتراك النادي", "CLUB", cond="IF_CLUB"),
]))
body.append(P(R("دفع الطرف الثاني (المشتري) للطرف الأول (البائع) عند توقيع هذا العقد مبلغ "), V("DOWN", b=True), R(" جنيه ("), V("DOWN_W"),
              R(") على سبيل العربون، يُخصم من المقدم، ويُسدد الباقي وقدره "), V("REST", b=True), R(" جنيه ("), V("REST_W"), R(") عند إتمام التنازل."),
              before=80, after=60, keep=False))
KEEP[0] = False

# ---------- Clauses ----------
def clause(title, *paras):
    body.append(heading(title))
    for p in paras: body.append(p)

clause("تمهيد",
       P(R("يمتلك الطرف الأول الوحدة المبينة أعلاه بمشروع ("), V("PROJECT"), R(") التابع لشركة "), V("DEVELOPER"),
         R("، وقد عاينها الطرف الثاني واطلع على عقدها ورغب في شرائها. وأقر الطرفان بأهليتهما للتعاقد، واتفقا على ما يلي، ويُعد هذا التمهيد والجداول السابقة جزءاً لا يتجزأ من العقد.")))
clause("البند الأول – البيع",
       P(R("باع الطرف الأول للطرف الثاني القابل لذلك الوحدة المبينة أعلاه، بيعاً موقوفاً على سداد كامل المقدم.")))
clause("البند الثاني – الثمن",
       P(R("يلتزم الطرف الثاني بسداد باقي المقدم للطرف الأول عند إتمام التنازل، وبسداد باقي المبالغ الواردة بجدول الثمن للشركة المطورة في مواعيدها بعد التنازل، ويتحمل مصاريف التنازل لدى الشركة المالكة.")))
clause("البند الثالث – مدة العقد",
       P(R("مدة هذا العقد "), V("DURATION"), R(" ("), V("DURATION_W"), R(") يوماً من تاريخ توقيعه، يلتزم خلالها الطرف الأول بحجز موعد التنازل لدى الشركة المالكة، إلا لظرف قهري أو إذا ثبت أن أقرب موعد متاح لدى الشركة يتجاوز هذه المدة. وإذا لم يتم التنازل وسداد باقي المقدم خلالها، يُعتبر العقد مفسوخاً من تلقاء نفسه دون حاجة إلى إنذار، ويُطبق الشرط الجزائي على الطرف المتسبب.")))
clause("البند الرابع – إقرارات البائع",
       P(R("يقر الطرف الأول بأن الوحدة مسجلة باسمه لدى الشركة المالكة ولم يتصرف فيها، ويلتزم بعدم التصرف فيها أو ترتيب أي حقوق عليها، وبأنها خالية من الغرامات والمتأخرات حتى تاريخ التنازل وإلا تحملها. ولا يحق له مطالبة الطرف الثاني بأي مبالغ غير الواردة بهذا العقد.")),
       P(R("ويتحمل الطرف الأول ضريبة التصرفات العقارية ويقدم ما يثبت سدادها عند التنازل."), V("IF_TAX", sz=2)))
clause("البند الخامس – الشرط الجزائي",
       P(R("إذا عدل الطرف الثاني عن الشراء أو أخل بأي بند من بنود هذا العقد، لا يسترد العربون المدفوع وقدره "), V("DOWN"), R(" جنيه. "),
         R("وإذا عدل الطرف الأول عن البيع أو أخل بأي بند، يلتزم برد العربون كاملاً ودفع شرط جزائي قدره "), V("PENALTY"), R(" جنيه ("), V("PENALTY_W"), R(").")))
clause("البند السادس – أحكام عامة",
       P(R("يُعد العنوان المبين قرين كل طرف موطناً مختاراً له تصح عليه المراسلات والإعلانات. ويسري القانون المصري على ما لم يرد به نص، وتختص محكمة "), V("COURT"),
         R(" الابتدائية بأي نزاع ينشأ عن هذا العقد. حُرر هذا العقد من ("), V("COPIES"), R(") نسخ أصلية، بيد كل طرف نسخة للعمل بموجبها.")))

# ---------- Signatures (full, at the end) ----------
body.append(P(R(""), after=200))
sig = lambda t: cell(cp(R(t, b=True), jc="center") + P(R(""), after=120) + cp(lab("الاسم: "), R("...........................................")) + P(R(""), after=120) + cp(lab("التوقيع: "), R(".........................................")), half, valign="top")
body.append(table([half, half], [row([sig("الطرف الأول (البائع)"), sig("الطرف الثاني (المشتري)")])], borders=False))

sect = ('<w:sectPr><w:headerReference w:type="default" r:id="rIdHdr"/><w:footerReference w:type="default" r:id="rIdFtr"/>'
        '<w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="850" w:right="1134" w:bottom="1300" w:left="1134" w:header="400" w:footer="350" w:gutter="0"/>'
        '<w:bidi/><w:docGrid w:linePitch="360"/></w:sectPr>')
NS = ('xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" '
      'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" '
      'xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" '
      'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" '
      'xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"')
document = f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document {NS}><w:body>{"".join(body)}{sect}</w:body></w:document>'

# header: the faded logo behind the text, centred on every page
wm_w, wm_h = 5400000, 3598000
header = (f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:hdr {NS}><w:p><w:pPr><w:bidi/></w:pPr><w:r><w:drawing>'
          f'<wp:anchor distT="0" distB="0" distL="0" distR="0" simplePos="0" relativeHeight="0" behindDoc="1" locked="1" layoutInCell="1" allowOverlap="1">'
          '<wp:simplePos x="0" y="0"/><wp:positionH relativeFrom="page"><wp:align>center</wp:align></wp:positionH>'
          '<wp:positionV relativeFrom="page"><wp:align>center</wp:align></wp:positionV>'
          f'<wp:extent cx="{wm_w}" cy="{wm_h}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:wrapNone/><wp:docPr id="2" name="Watermark"/>'
          '<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">'
          '<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="2" name="wm.png"/><pic:cNvPicPr/></pic:nvPicPr>'
          '<pic:blipFill><a:blip r:embed="rIdWm"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>'
          f'<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="{wm_w}" cy="{wm_h}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic>'
          '</a:graphicData></a:graphic></wp:anchor></w:drawing></w:r></w:p></w:hdr>')
fld = lambda code: (f'<w:r>{rpr(sz=SMALL, color="777777")}<w:fldChar w:fldCharType="begin"/></w:r><w:r>{rpr(sz=SMALL, color="777777")}<w:instrText xml:space="preserve"> {code} </w:instrText></w:r>'
                    f'<w:r>{rpr(sz=SMALL, color="777777")}<w:fldChar w:fldCharType="separate"/></w:r><w:r>{rpr(sz=SMALL, color="777777")}<w:t>1</w:t></w:r><w:r>{rpr(sz=SMALL, color="777777")}<w:fldChar w:fldCharType="end"/></w:r>')
G = "777777"
ftr_sig = table([W // 2, W // 2], [row([
    cell(P(R("توقيع الطرف الأول: ", sz=SMALL, color=G), R("..............................", sz=SMALL, color=G), jc="start", after=0), W // 2),
    cell(P(R("توقيع الطرف الثاني: ", sz=SMALL, color=G), R("..............................", sz=SMALL, color=G), jc="end", after=0), W // 2)])], borders=False)
footer = (f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr {NS}>' + ftr_sig
          + P(R("صفحة ", sz=SMALL, color=G), fld("PAGE"), R(" من ", sz=SMALL, color=G), fld("NUMPAGES"),
              R("  ·  ", sz=SMALL, color=G), f'<w:r>{rpr(sz=SMALL, color=G, rtl=False)}<w:t>Origin Real Estate</w:t></w:r>', jc="center", before=60, after=0)
          + "</w:ftr>")

styles = (f'<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
          f'<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="{FONT}" w:hAnsi="{FONT}" w:cs="{FONT}" w:eastAsia="{FONT}"/><w:sz w:val="{BODY}"/><w:szCs w:val="{BODY}"/><w:lang w:val="en-US" w:bidi="ar-EG"/></w:rPr></w:rPrDefault>'
          '<w:pPrDefault><w:pPr><w:bidi/><w:spacing w:after="60" w:line="300" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>'
          '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:pPr><w:bidi/></w:pPr></w:style>'
          '<w:style w:type="table" w:default="1" w:styleId="TableNormal"><w:name w:val="Normal Table"/><w:tblPr><w:tblInd w:w="0" w:type="dxa"/><w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="108" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="108" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style>'
          '</w:styles>')
settings = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
            '<w:updateFields w:val="true"/><w:defaultTabStop w:val="720"/><w:themeFontLang w:val="en-US" w:bidi="ar-EG"/><w:compat><w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/></w:compat></w:settings>')
ct = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
      '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>'
      '<Default Extension="png" ContentType="image/png"/>'
      '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'
      '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>'
      '<Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/>'
      '<Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>'
      '<Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/></Types>')
rels = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>')
img = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/image"
docrels = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
           '<Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>'
           '<Relationship Id="rIdSettings" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings" Target="settings.xml"/>'
           '<Relationship Id="rIdHdr" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>'
           '<Relationship Id="rIdFtr" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>'
           f'<Relationship Id="rIdLogo" Type="{img}" Target="media/logo.png"/></Relationships>')
hdrrels = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
           f'<Relationship Id="rIdWm" Type="{img}" Target="media/wm.png"/></Relationships>')
with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as z:
    z.writestr("[Content_Types].xml", ct); z.writestr("_rels/.rels", rels)
    z.writestr("word/document.xml", document); z.writestr("word/styles.xml", styles); z.writestr("word/settings.xml", settings)
    z.writestr("word/header1.xml", header); z.writestr("word/footer1.xml", footer)
    z.writestr("word/_rels/document.xml.rels", docrels); z.writestr("word/_rels/header1.xml.rels", hdrrels)
    z.write(os.path.join(os.path.dirname(__file__), "contract_assets", "logo.png"), "word/media/logo.png"); z.write(os.path.join(os.path.dirname(__file__), "contract_assets", "wm.png"), "word/media/wm.png")
print("written", OUT, len(document))
