
// ======================= TEAM & OPERATIONS =======================
// Policies (work regulation + employment contract), leave, deductions, evaluations,
// onboarding, planning (snapshot, alerts, cash flow, profit share, hiring, commission what-if),
// unit comparison for clients, deal checklist.
// This file is appended to src_app.jsx at build time, so it shares its helpers.

// Bump when the regulation or the contract text changes: everyone is asked to accept again.
const POLICY_VERSION = 1;
const COMPANY_LEGAL = "أور للتسويق والسمسرة العقارية (أحمد صبحي صادق وشريكه)";

const REGULATION_MD = `# لائحة تنظيم العمل والجزاءات — ${COMPANY_LEGAL}

## الباب الأول: أحكام عامة
**مادة (1) — نطاق التطبيق:** تسري أحكام هذه اللائحة على جميع العاملين بشركة ${COMPANY_LEGAL}، أيًا كانت وظائفهم، ويُعمل بها من تاريخ اعتمادها. وتُعد مكملة لعقد العمل الفردي ولأحكام قانون العمل رقم 14 لسنة 2025، ويُطبق القانون فيما لم يرد به نص فيها.

**مادة (2) — التعريفات:**
- **الشركة:** ${COMPANY_LEGAL} — شركة تضامن، سجل تجاري رقم 48840، ومقرها مكتب 2، الدور الثاني، مول ميلا نايت، شارع جاردينيا، الحي 13، مدينة 6 أكتوبر.
- **الموظف:** كل من يعمل لدى الشركة بأجر تحت إدارتها وإشرافها.
- **المدير المباشر:** قائد الفريق أو المدير الذي يتبعه الموظف.
- **الإدارة:** المدير العام أو من يفوضه.
- **نظام الشركة (CRM):** نظام إدارة العملاء والوحدات الخاص بالشركة، وهو السجل الرسمي للحضور والعملاء والصفقات والإجازات والجزاءات.
- **الأجر اليومي:** الأجر الأساسي الشهري مقسومًا على 30.

**مادة (3) — الإعلان:** تُنشر هذه اللائحة على نظام الشركة، ويُقر كل موظف إلكترونيًا بالاطلاع عليها والالتزام بها، وكذلك عند أي تعديل لاحق.

## الباب الثاني: التعيين وفترة الاختبار
**مادة (4) — الوظائف:** تضم الشركة حاليًا الوظائف التالية: مستشار مبيعات (Sales)، وقائد فريق (Team Leader)، ومدير مبيعات (Sales Manager)، ويجوز للإدارة استحداث وظائف أخرى وفق احتياج العمل.

**مادة (5) — التعيين:** يكون التعيين بعقد عمل مكتوب من نسختين، يحتفظ الموظف بإحداهما، ويبيّن الوظيفة والأجر الأساسي ونظام العمولة وتاريخ بدء العمل.

**مادة (6) — مستندات التعيين:** يقدم الموظف قبل استلام العمل: صورة بطاقة الرقم القومي، المؤهل الدراسي، صحيفة الحالة الجنائية، موقف التجنيد، وصورًا شخصية. وتحتفظ الشركة بملف خدمة لكل موظف، ويجوز حفظه إلكترونيًا.

**مادة (7) — فترة الاختبار:** يُعيَّن الموظف تحت الاختبار لمدة **ثلاثة أشهر** من تاريخ استلامه العمل، ولا يجوز تعيينه تحت الاختبار أكثر من مرة واحدة لدى الشركة. وللشركة إنهاء العقد خلال فترة الاختبار إذا ثبت عدم صلاحية الموظف، وذلك وفق الضوابط المقررة قانونًا.

**مادة (8) — تقييم الأداء:** يُقيَّم أداء الموظف شهريًا بناءً على مؤشرات الأداء المسجلة على نظام الشركة (المكالمات، المقابلات، الصفقات، الالتزام بالحضور)، ويُبلّغ الموظف بنتيجة تقييمه.

## الباب الثالث: مواعيد العمل والحضور
**مادة (9) — أيام وساعات العمل:** العمل من الأحد إلى الخميس، من الساعة **10:30 صباحًا حتى 7:00 مساءً**، تتخللها فترة راحة لا تدخل في ساعات العمل الفعلية. ويوما الجمعة والسبت راحة أسبوعية مدفوعة الأجر.

**مادة (10) — إثبات الحضور:** يثبت الموظف حضوره يوميًا بالبصمة أو بتسجيل الحضور على نظام الشركة، ويُعتد بالوقت المسجل آليًا. ولا يجوز للموظف تسجيل حضور غيره.

**مادة (11) — مهلة الحضور والتأخير:**
1. موعد الحضور 10:30 صباحًا، ويُمنح جميع الموظفين مهلة حتى **11:00** دون أي خصم.
2. يُسمح لكل موظف بالحضور حتى **11:15** مرتين في الشهر دون خصم.
3. بعد استنفاد المرتين، يُعد الحضور من الساعة **11:01** تأخيرًا تطبق عليه الجزاءات الواردة في الباب الثامن.
4. الحضور من الساعة **12:00** ظهرًا فما بعد يُعد تأخيرًا جسيمًا.
5. يُعاد حساب مرات التأخير من بداية كل شهر ميلادي.

**مادة (12) — الانصراف:** لا يجوز الانصراف قبل الساعة 7:00 مساءً إلا بإذن من المدير المباشر مسجل على نظام الشركة. ويُستثنى من ذلك المقابلات والمعاينات الخارجية المسجلة مسبقًا.

**مادة (13) — العمل الميداني:** المقابلات مع العملاء والمعاينات خارج المكتب جزء من العمل، بشرط تسجيلها على نظام الشركة مع الموعد والمكان، وإبلاغ المدير المباشر.

**مادة (13 مكرر) — العمل في أيام الراحة والإجازات:** يجوز للإدارة تكليف الموظف بالعمل في يوم الراحة الأسبوعية أو في أيام العطلات إذا اقتضت ظروف العمل ذلك، مثل المعاينات والمقابلات وتوقيع العقود، على أن يُبلّغ بذلك مسبقًا كلما أمكن، ويُمنح يوم راحة بديلًا أو المقابل المقرر قانونًا.

## الباب الرابع: الأجور والعمولات
**مادة (14) — موعد صرف الأجر:** يُصرف الأجر الشهري من اليوم الأول حتى اليوم الخامس من كل شهر عن الشهر السابق، نقدًا أو بتحويل بنكي أو بأي وسيلة دفع إلكتروني معتمدة.

**مادة (15) — مفردات الأجر:** يتكون أجر الموظف من الأجر الأساسي المحدد في عقده، والعمولات المستحقة عن الصفقات وفق نظام العمولات المعتمد من الإدارة.

**مادة (16) — استحقاق العمولة:**
1. تُستحق العمولة عن الصفقة بعد اعتمادها من الإدارة على نظام الشركة وتحصيل الشركة لعمولتها فعليًا.
2. تُحسب العمولة وفق النسب المسجلة للموظف على النظام وقت إتمام الصفقة، وتُقسم عند اشتراك أكثر من موظف بحسب النسب المسجلة لكل منهم.
3. **يظل الموظف مستحقًا لعمولته عن الصفقات التي تمت أثناء خدمته حتى لو انتهت خدمته**، وتُصرف له عند تحصيلها.
4. لا تُستحق أي عمولة عن صفقة غير مسجلة على نظام الشركة، أو تمت بالمخالفة للباب السادس.

**مادة (17) — الخصم من الأجر:** لا يجوز الخصم من أجر الموظف إلا في الحالات الواردة في هذه اللائحة والقانون، ويُحسب خصم الجزاءات من الأجر الأساسي وحده، ويظهر مفصلًا للموظف على نظام الشركة.

## الباب الخامس: الإجازات والأذونات
**مادة (18) — الإجازة السنوية:** يستحق الموظف إجازة سنوية مدفوعة الأجر بواقع:
- **15 يومًا** في السنة، منها **أسبوع متصل** يُؤخذ دفعة واحدة في موعد تحدده الإدارة بالاتفاق مع الموظف.
- باقي الأيام يجوز الحصول عليها متفرقة على مدار العام.

ولا يخل ذلك بأي حد أدنى أعلى يقرره القانون حسب مدة الخدمة أو سن الموظف.

**مادة (19) — الإجازات الأخرى:** يستحق الموظف الإجازات الأخرى المقررة قانونًا، وفق الشروط والإجراءات التي يحددها القانون.

**مادة (20) — طلب الإجازة والإذن:**
1. تُطلب الإجازات والأذونات على نظام الشركة، وتُعد مرفوضة ما لم يوافق عليها المدير المباشر أو الإدارة.
2. تُطلب الإجازة المخططة قبل موعدها بيومي عمل على الأقل، والأسبوع المتصل قبل موعده بأسبوعين على الأقل.
3. في الحالات الطارئة يُبلغ الموظف مديره المباشر قبل موعد الحضور، ويسجل الطلب على النظام في نفس اليوم.
4. يظهر لكل موظف رصيد إجازاته المتبقي على نظام الشركة.

**مادة (21) — العطلات الرسمية:** يستحق الموظف العطلات الرسمية التي يصدر بها قرار من الجهات المختصة بأجر كامل، ولا تُحتسب من رصيده.

**مادة (22) — الغياب دون إذن:** يُعد غيابًا دون إذن كل يوم لا يُسجل فيه حضور ولا إجازة معتمدة، ولا يُستحق عنه أجر، فضلًا عن الجزاء المقرر له.

## الباب السادس: واجبات الموظف والعملاء والسرية
**مادة (23) — التسجيل على نظام الشركة:** يلتزم الموظف بتسجيل كل عميل وكل وحدة وكل مكالمة ومقابلة ومتابعة وصفقة على نظام الشركة في نفس اليوم، ببيانات صحيحة وكاملة.

**مادة (24) — وسائل التواصل:** يكون التواصل مع العملاء والملاك **من خطوط الشركة فقط** (الهاتف وواتساب)، ومن خلال نظام الشركة. ولا يجوز التواصل معهم من أرقام شخصية.

**مادة (25) — ملكية العملاء والبيانات:** جميع العملاء والملاك والوحدات والبيانات والشيتات التي يتعامل معها الموظف بسبب عمله **ملك للشركة**، سواء حصل عليها من الشركة أو بجهده أثناء العمل.

**مادة (26) — السرية:** يلتزم الموظف أثناء خدمته وبعد انتهائها بعدم إفشاء أو نسخ أو تصوير أو إرسال أي بيانات خاصة بالعملاء أو الملاك أو الأسعار أو العمولات أو أنظمة الشركة لأي طرف خارجي، أو استخدامها لغير مصلحة الشركة.

**مادة (27) — العملاء عند ترك العمل:** عند انتهاء الخدمة لأي سبب، يظل العملاء والملاك الذين كان يتابعهم الموظف عملاء للشركة، وتُنقل متابعتهم لموظف آخر، و**لا يجوز للموظف أخذ أي منهم أو التعامل معهم لحسابه أو لحساب غيره**.

**مادة (28) — العمل لحساب الغير:** لا يجوز للموظف أثناء خدمته العمل بالتسويق العقاري لحسابه الخاص أو لحساب جهة أخرى، أو تحويل أي عميل أو وحدة خارج الشركة، أو قبول أي مبالغ من العملاء أو الملاك باسمه الشخصي.

**مادة (29) — التسليم عند المغادرة:** يسلم الموظف عند ترك العمل جميع ما في عهدته (خطوط الشركة، الأجهزة، المستندات)، ويُوقف دخوله على نظام الشركة فور انتهاء خدمته.

## الباب السابع: المظهر والسلوك
**مادة (30) — المظهر:** يلتزم الموظف بمظهر مهني لائق يمثل الشركة، وبالملابس الرسمية أو شبه الرسمية (Smart Casual) في المكتب وفي المقابلات والمعاينات.

**مادة (31) — السلوك مع العملاء:** يلتزم الموظف بالاحترام والصدق في التعامل مع العملاء والملاك، وبعدم تقديم معلومات غير صحيحة عن الوحدات أو الأسعار، وبالالتزام بمواعيد المقابلات، وباحترام طلب أي مالك بعدم التواصل معه مجددًا.

**مادة (32) — السلوك داخل العمل:** يلتزم الموظف باحترام زملائه ورؤسائه، وتنفيذ التعليمات المتعلقة بالعمل، والمحافظة على ممتلكات الشركة، وعدم التدخين داخل المكتب إلا في الأماكن المخصصة. ويُحظر أي شكل من أشكال التمييز أو التنمر أو التحرش.

## الباب الثامن: المخالفات والجزاءات
**مادة (33) — جزاءات التأخير:** يُخصم من الأجر اليومي عن كل تأخير بعد استنفاد مرتي السماح (مادة 11) وفق الجدول التالي:

| مرة التأخير في الشهر (من 11:01 حتى 11:59) | الخصم من الأجر اليومي |
| --- | --- |
| الأولى | 10% |
| الثانية | 15% |
| الثالثة | 20% |
| كل مرة تالية | تزيد 5% عن المرة السابقة |
| الحضور من الساعة 12:00 ظهرًا أو بعدها | نصف يوم |

ويُحتسب التأخير من الساعة 12:00 ضمن عدد مرات التأخير في الشهر.

**مادة (34) — الحد الأقصى للخصم:** لا يجاوز إجمالي خصومات التأخير أجر **خمسة أيام** في الشهر الواحد. وللإدارة توقيع جزاءات أخرى عن المخالفات الواردة في المادة (36)، في الحدود التي يسمح بها القانون.

**مادة (35) — الإعفاء:** للإدارة وللمدير المباشر إعفاء الموظف من خصم أي تأخير لعذر مقبول أو بإذن مسبق، أو تعديل قيمة الخصم، مع تسجيل السبب على نظام الشركة. ولا يُنفذ أي خصم إلا بعد اعتماده من الإدارة أو المدير المباشر.

**مادة (36) — جدول المخالفات الأخرى:**

| المخالفة | أول مرة | ثاني مرة | ثالث مرة |
| --- | --- | --- | --- |
| الغياب دون إذن (عن كل يوم) | خصم يوم | خصم يومين | خصم 3 أيام |
| الانصراف قبل الموعد دون إذن | إنذار كتابي | خصم نصف يوم | خصم يوم |
| عدم تسجيل عميل أو مكالمة أو مقابلة على النظام | إنذار كتابي | خصم نصف يوم | خصم يوم |
| التواصل مع العملاء من رقم شخصي | إنذار كتابي | خصم يوم | خصم يومين |
| مخالفة قواعد المظهر أو السلوك | إنذار كتابي | خصم نصف يوم | خصم يوم |
| إفشاء بيانات الشركة أو العملاء، أو العمل لحساب الغير، أو تحويل عميل خارج الشركة | خصم 5 أيام | الفصل وفق القانون | — |

**مادة (37) — ضوابط توقيع الجزاء:**
1. لا يُوقع أكثر من جزاء واحد عن المخالفة الواحدة.
2. لا يُوقع جزاء بخلاف خصومات التأخير المثبتة آليًا إلا بعد إخطار الموظف كتابةً بالمخالفة وسماع أقواله وتحقيق دفاعه، ويثبت ذلك في محضر مكتوب.
3. يُخطر الموظف بالجزاء الموقع عليه وسببه على نظام الشركة، وله التظلم منه للإدارة خلال سبعة أيام من إخطاره.
4. يُعاد احتساب تكرار المخالفة بعد مرور ستة أشهر دون تكرارها، عدا التأخير الذي يُعاد حسابه شهريًا.

## الباب التاسع: انتهاء الخدمة وأحكام ختامية
**مادة (38) — الاستقالة:** يقدم الموظف استقالته كتابةً، ويلتزم بمدة الإخطار المقررة قانونًا وبتسليم عمله وعملائه لمن تحدده الإدارة.

**مادة (39) — المستحقات عند انتهاء الخدمة:** يُصرف للموظف أجره حتى آخر يوم عمل، ورصيد إجازاته وفق القانون، وعمولاته عن الصفقات التي تمت أثناء خدمته عند تحصيلها (مادة 16).

**مادة (40) — الفصل:** لا يجوز فصل الموظف إلا في الحالات وبالإجراءات التي يحددها القانون، ومنها إفشاء أسرار الشركة أو العمل لحساب الغير أو تكرار الغياب دون إذن بالحد الذي يقرره القانون.

**مادة (41) — التعديل:** للإدارة تعديل هذه اللائحة بما لا يخالف القانون، ويُعمل بالتعديل بعد اعتماده وإعلانه للموظفين على نظام الشركة.

**مادة (42) — النفاذ:** يُعمل بهذه اللائحة من تاريخ اعتمادها من الجهة الإدارية المختصة.`;

const CONTRACT_MD = `# عقد عمل — ${COMPANY_LEGAL}

## أطراف العقد
**الطرف الأول (صاحب العمل):** شركة ${COMPANY_LEGAL} — شركة تضامن، سجل تجاري رقم 48840، بطاقة ضريبية رقم 784124515، ومقرها مكتب 2، الدور الثاني، مول ميلا نايت، شارع جاردينيا، الحي 13، مدينة 6 أكتوبر، ويمثلها في التوقيع السيد / أحمد صبحي صادق بصفته الشريك المتضامن.

**الطرف الثاني (الموظف):** المبينة بياناته في النسخة الورقية الموقعة من هذا العقد.

**تمهيد:** يعمل الطرف الأول في مجال التسويق والسمسرة العقارية، وقد رغب في التعاقد مع الطرف الثاني للعمل لديه، واتفق الطرفان وهما بكامل أهليتهما على الآتي. ويُعد هذا التمهيد جزءًا لا يتجزأ من العقد.

## الوظيفة والمدة
**البند الأول — الوظيفة:** يعمل الطرف الثاني لدى الطرف الأول بوظيفة (مستشار مبيعات / قائد فريق / مدير مبيعات)، ويؤدي المهام التي يكلفه بها الطرف الأول في حدود طبيعة عمله. ويكون مقر العمل مقر الشركة، مع الانتقال للمقابلات والمعاينات التي يستلزمها العمل.

**البند الثاني — مدة العقد:** مدة هذا العقد **سنة واحدة** تبدأ من تاريخ استلام العمل، وتتجدد تلقائيًا لمدد مماثلة ما لم يُخطر أحد الطرفين الآخر كتابةً بعدم رغبته في التجديد قبل انتهاء المدة بشهر على الأقل.

**البند الثالث — فترة الاختبار:** يخضع الطرف الثاني لفترة اختبار مدتها **ثلاثة أشهر** من تاريخ استلام العمل، وللطرف الأول إنهاء العقد خلالها إذا ثبت عدم صلاحية الطرف الثاني، وفق الضوابط المقررة قانونًا.

**البند الرابع — مواعيد العمل:** يلتزم الطرف الثاني بمواعيد العمل والحضور والإجازات الواردة في لائحة تنظيم العمل والجزاءات للشركة، وهي حاليًا من الأحد إلى الخميس من 10:30 صباحًا حتى 7:00 مساءً، والجمعة والسبت راحة أسبوعية.

## الأجر والعمولات والتأمينات
**البند الخامس — الأجر:** يتقاضى الطرف الثاني الأجر الأساسي الشهري المبين في النسخة الورقية الموقعة من هذا العقد، يُصرف من اليوم الأول حتى اليوم الخامس من كل شهر عن الشهر السابق، نقدًا أو بتحويل بنكي أو إلكتروني.

**البند السادس — العمولات:** يستحق الطرف الثاني، بالإضافة إلى أجره الأساسي، عمولات عن الصفقات وفق **نظام العمولات المعتمد من الطرف الأول** والمسجل على نظام الشركة (CRM) وقت إتمام الصفقة. وتُستحق العمولة بعد اعتماد الصفقة وتحصيل الطرف الأول لعمولته فعليًا، ويظل الطرف الثاني مستحقًا لعمولته عن الصفقات التي تمت أثناء خدمته حتى بعد انتهائها. وللطرف الأول تعديل نظام العمولات بإخطار مسبق، ويسري التعديل على الصفقات التالية لتاريخه فقط.

**البند السابع — التأمينات الاجتماعية:** يلتزم الطرف الأول بالتأمين على الطرف الثاني لدى الهيئة القومية للتأمين الاجتماعي وفق أحكام قانون التأمينات الاجتماعية، ويُستقطع نصيب الطرف الثاني من الاشتراكات من أجره.

**البند الثامن — الإجازات:** يستحق الطرف الثاني الإجازات الواردة في لائحة تنظيم العمل والقانون، وتُطلب وتُعتمد من خلال نظام الشركة.

## الالتزامات والسرية والعملاء
**البند التاسع — اللائحة:** يقر الطرف الثاني باطلاعه على لائحة تنظيم العمل والجزاءات للشركة وموافقته عليها، وتُعد اللائحة وتعديلاتها المعتمدة جزءًا مكملًا لهذا العقد.

**البند العاشر — نظام الشركة ووسائل التواصل:** يلتزم الطرف الثاني بتسجيل كل عمله (العملاء، الوحدات، المكالمات، المقابلات، الصفقات) على نظام الشركة، وبالتواصل مع العملاء والملاك من خطوط الشركة فقط.

**البند الحادي عشر — السرية:** يلتزم الطرف الثاني أثناء مدة العقد وبعد انتهائها بالحفاظ على سرية بيانات العملاء والملاك والوحدات والأسعار والعمولات وأنظمة الطرف الأول، وعدم نسخها أو إفشائها أو استخدامها لغير مصلحة الطرف الأول.

**البند الثاني عشر — العملاء:** جميع العملاء والملاك الذين يتعامل معهم الطرف الثاني بسبب عمله عملاء للطرف الأول. ولا يجوز للطرف الثاني أثناء العقد أو بعد انتهائه أخذ أي منهم، أو التعامل معهم لحسابه أو لحساب الغير، أو توجيههم لجهة أخرى.

**البند الثالث عشر — عدم العمل لحساب الغير:** لا يجوز للطرف الثاني أثناء مدة العقد العمل في التسويق أو السمسرة العقارية لحسابه الخاص أو لحساب أي جهة أخرى، أو قبول أي مبالغ من العملاء أو الملاك باسمه الشخصي.

**البند الرابع عشر — العهدة:** يلتزم الطرف الثاني بالمحافظة على ما يُسلم له من خطوط وأجهزة ومستندات، وردها فور انتهاء العقد.

## إنهاء العقد وأحكام ختامية
**البند الخامس عشر — الاستقالة:** يجوز للطرف الثاني الاستقالة بإخطار كتابي وفق مدة الإخطار المقررة قانونًا، ويلتزم خلالها بتسليم عمله وعملائه وعهدته لمن يحدده الطرف الأول.

**البند السادس عشر — الإنهاء:** لا يجوز إنهاء العقد من الطرف الأول إلا في الحالات وبالإجراءات الواردة في القانون واللائحة. ويُعد الإخلال بالبنود (11) و(12) و(13) خطأً جسيمًا، مع حق الطرف الأول في المطالبة بالتعويض عما يلحقه من ضرر.

**البند السابع عشر — المستحقات عند الانتهاء:** يُصرف للطرف الثاني أجره حتى آخر يوم عمل، ومقابل رصيد إجازاته وفق القانون، وعمولاته عن الصفقات التي تمت أثناء خدمته عند تحصيلها.

**البند الثامن عشر — القانون الواجب التطبيق:** يسري على هذا العقد قانون العمل رقم 14 لسنة 2025 ولائحة تنظيم العمل للشركة فيما لم يرد به نص، وتختص المحكمة العمالية المختصة بنظر أي نزاع ينشأ عنه.

**البند التاسع عشر — النسخ:** تحرر هذا العقد من ثلاث نسخ، بيد كل طرف نسخة، والثالثة تُودع لدى التأمينات الاجتماعية. ويُعتد بموافقة الطرف الثاني الإلكترونية على العقد واللائحة من خلال نظام الشركة إقرارًا منه بالاطلاع عليهما، دون أن يغني ذلك عن التوقيع الورقي.`;

// Grey placeholder lines while something loads
function Skeleton({ lines = 3, height = 14 }) {
  return <div data-skeleton style={{ marginTop: 10 }}>{[...Array(lines)].map((_, i) => <div key={i} className="skeleton" style={{ borderRadius: 8, height, width: `${92 - ((i * 17) % 35)}%`, marginBottom: 8 }} />)}</div>;
}

// Tiny markdown for the policy texts: headings, bold, lists, tables, paragraphs
function mdInline(text, keyBase) {
  return String(text).split(/(\*\*[^*]+\*\*)/g).map((p, i) => p.startsWith("**") && p.endsWith("**") ? <b key={keyBase + "-" + i}>{p.slice(2, -2)}</b> : <React.Fragment key={keyBase + "-" + i}>{p}</React.Fragment>);
}
function PolicyMd({ text }) {
  const lines = String(text).split("\n");
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (!l.trim()) continue;
    if (l.startsWith("# ")) { out.push(<h2 key={i} style={{ fontSize: 19, color: COLORS.navy, margin: "4px 0 12px" }}>{l.slice(2)}</h2>); continue; }
    if (l.startsWith("## ")) { out.push(<h3 key={i} style={{ fontSize: 15.5, color: COLORS.navy, margin: "18px 0 8px", borderBottom: `1px solid ${COLORS.border}`, paddingBottom: 4 }}>{l.slice(3)}</h3>); continue; }
    if (l.startsWith("|")) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith("|")) { if (!/^\|\s*-/.test(lines[i])) rows.push(lines[i].split("|").slice(1, -1).map((c) => c.trim())); i++; }
      i--;
      out.push(<div key={i} style={{ overflowX: "auto", margin: "8px 0" }}><table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}><tbody>{rows.map((r, ri) => (
        <tr key={ri}>{r.map((c, ci) => ri === 0 ? <th key={ci} style={{ border: `1px solid ${COLORS.border}`, padding: "6px 8px", background: COLORS.cream, textAlign: "right" }}>{mdInline(c, `${i}-${ri}-${ci}`)}</th> : <td key={ci} style={{ border: `1px solid ${COLORS.border}`, padding: "6px 8px" }}>{mdInline(c, `${i}-${ri}-${ci}`)}</td>)}</tr>
      ))}</tbody></table></div>);
      continue;
    }
    if (/^(- |\d+\. )/.test(l)) {
      const ordered = /^\d+\. /.test(l); const items = [];
      while (i < lines.length && /^(- |\d+\. )/.test(lines[i])) { items.push(lines[i].replace(/^(- |\d+\. )/, "")); i++; }
      i--;
      const Tag = ordered ? "ol" : "ul";
      out.push(<Tag key={i} style={{ margin: "4px 0 8px", paddingInlineStart: 22 }}>{items.map((it, k) => <li key={k} style={{ marginBottom: 3 }}>{mdInline(it, `${i}-${k}`)}</li>)}</Tag>);
      continue;
    }
    out.push(<p key={i} style={{ margin: "6px 0", lineHeight: 1.75 }}>{mdInline(l, String(i))}</p>);
  }
  return <div dir="rtl" style={{ fontSize: 14, color: COLORS.text, textAlign: "right" }}>{out}</div>;
}

const policyDocs = [{ id: "regulation", label: "Work regulation", text: REGULATION_MD }, { id: "contract", label: "Employment contract", text: CONTRACT_MD }];

// Shown instead of the app when the admin requires acceptance and this person hasn't accepted this version
function PolicyGate({ profile, getToken, onAccepted, onSignOut }) {
  const [doc, setDoc] = useState("regulation");
  const [readAll, setReadAll] = useState({});
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const boxRef = useRef(null);
  const onScroll = (e) => { const el = e.currentTarget; if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) setReadAll((r) => ({ ...r, [doc]: true })); };
  useEffect(() => { if (boxRef.current) { boxRef.current.scrollTop = 0; const el = boxRef.current; if (el.scrollHeight <= el.clientHeight + 40) setReadAll((r) => ({ ...r, [doc]: true })); } }, [doc]);
  const both = readAll.regulation && readAll.contract;
  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "calc(16px + env(safe-area-inset-top)) 14px 24px" }}>
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.navy }}>Before you continue, {profile.name.split(" ")[0]}</div>
        <div style={{ fontSize: 13, color: COLORS.textMuted, margin: "4px 0 12px" }}>Please read the company's work regulation and your employment contract to the end, then confirm.</div>
        <div className="seg" style={{ marginBottom: 10 }}>
          {policyDocs.map((d) => <button key={d.id} className={doc === d.id ? "on" : ""} onClick={() => setDoc(d.id)}>{d.label}{readAll[d.id] ? " ✓" : ""}</button>)}
        </div>
        <div ref={boxRef} onScroll={onScroll} style={{ height: "58vh", overflowY: "auto", border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 14, background: "#fff" }}>
          <PolicyMd text={policyDocs.find((d) => d.id === doc).text} />
        </div>
        <label style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 12, fontSize: 13.5, opacity: both ? 1 : 0.5 }}>
          <input type="checkbox" disabled={!both} checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ marginTop: 3 }} />
          <span dir="rtl">أقر بأنني قرأت لائحة تنظيم العمل والجزاءات وعقد العمل، وأوافق على الالتزام بهما.</span>
        </label>
        {!both && <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>Scroll to the end of both documents first.</div>}
        {err && <div style={{ color: COLORS.danger, fontSize: 12.5, marginTop: 6 }}>{err}</div>}
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button style={{ ...btnPrimary, opacity: agree ? 1 : 0.5 }} disabled={!agree || busy} onClick={async () => {
            setBusy(true); setErr("");
            try { await db.insert("policy_acceptances", { user_id: profile.id, version: POLICY_VERSION }, await getToken()); onAccepted(); }
            catch (e) { setErr(e.message || "Couldn't save"); } finally { setBusy(false); }
          }}>{busy ? "Saving…" : "I agree"}</button>
          <button style={btnGhost} onClick={onSignOut}>Sign out</button>
        </div>
      </div>
    </div>
  );
}

function PoliciesPage({ profile, users, fin, getToken, refreshFinance }) {
  const [doc, setDoc] = useState("regulation");
  const [rows, setRows] = useState(null);
  const [busy, setBusy] = useState(false);
  const admin = isFinanceAdmin(profile);
  const required = !!fin.settings?.policies_required;
  useEffect(() => { (async () => { try { setRows(await db.select("policy_acceptances", "&order=accepted_at.desc", await getToken())); } catch (e) { setRows([]); } })(); }, []); // eslint-disable-line
  const staff = users.filter((u) => !["pending", "admin", "ceo", "guest"].includes(u.role) && (admin || u.id === profile.id || rows?.some((r) => r.user_id === u.id) || true));
  const accepted = (uid) => (rows || []).find((r) => r.user_id === uid && r.version === POLICY_VERSION);
  const mine = accepted(profile.id);
  if (!admin && !required) return <div className="card" style={{ padding: 16, color: COLORS.textMuted }}>Nothing here yet.</div>;
  return (
    <div>
      {admin && (
        <div className="card" style={{ padding: 14, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontWeight: 800, color: COLORS.navy }}>Require everyone to accept</div>
              <div style={{ fontSize: 12.5, color: COLORS.textMuted }}>{required ? "ON — staff must read and accept before using the CRM." : "OFF — only you can see these documents."} Version {POLICY_VERSION}.</div>
            </div>
            <button style={required ? btnDanger : btnPrimary} disabled={busy} onClick={async () => {
              if (!window.confirm(required ? "Turn it off? Staff will stop being asked." : "Turn it on? Everyone (except admin/CEO) must read and accept before continuing.")) return;
              setBusy(true);
              try { await db.update("finance_settings", 1, { policies_required: !required }, await getToken()); await refreshFinance(); } catch (e) { window.alert(e.message); } finally { setBusy(false); }
            }}>{required ? "Turn off" : "Turn on"}</button>
          </div>
          <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {staff.map((u) => { const a = accepted(u.id); return <Badge key={u.id} tone={a ? "active" : "pending"}>{u.name}{a ? ` ✓ ${formatDate(a.accepted_at)}` : " · not yet"}</Badge>; })}
          </div>
        </div>
      )}
      {!admin && mine && <div style={{ fontSize: 12.5, color: COLORS.success, marginBottom: 8 }}>You accepted these on {formatDate(mine.accepted_at)}.</div>}
      <div className="seg" style={{ marginBottom: 10 }}>{policyDocs.map((d) => <button key={d.id} className={doc === d.id ? "on" : ""} onClick={() => setDoc(d.id)}>{d.label}</button>)}</div>
      <div className="card" style={{ padding: 16 }}><PolicyMd text={policyDocs.find((d) => d.id === doc).text} /></div>
    </div>
  );
}

// ---------- shared date helpers (Cairo time) ----------
const cairoParts = (iso) => {
  const s = new Date(iso).toLocaleString("en-GB", { timeZone: "Africa/Cairo", hour12: false, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  const m = s.match(/(\d{2})\/(\d{2})\/(\d{4}),?\s+(\d{2}):(\d{2})/);
  return m ? { day: `${m[3]}-${m[2]}-${m[1]}`, minutes: (Number(m[4]) % 24) * 60 + Number(m[5]) } : { day: String(iso).slice(0, 10), minutes: 0 };
};
const todayCairo = () => cairoParts(new Date().toISOString()).day;
const dayOfWeek = (d) => new Date(`${d}T12:00:00Z`).getUTCDay();
const addDays = (d, n) => { const x = new Date(`${d}T12:00:00Z`); x.setUTCDate(x.getUTCDate() + n); return x.toISOString().slice(0, 10); };
const monthDays = (month) => { const out = []; let d = `${month}-01`; while (d.startsWith(month)) { out.push(d); d = addDays(d, 1); } return out; };
const workDaysBetween = (from, to, settings) => { const wd = workDaysOf(settings); let n = 0; for (let d = from; d <= to; d = addDays(d, 1)) if (wd.includes(dayOfWeek(d))) n++; return n; };
const hmToMin = (s) => { const [h, m] = String(s || "0:0").split(":").map(Number); return (h || 0) * 60 + (m || 0); };
const hm = (mins) => `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
const staffOf = (users) => users.filter((u) => !["pending", "admin", "ceo", "guest"].includes(u.role));

// ---------- deductions (rules from the work regulation, articles 11, 33, 34, 36) ----------
const LATE_RULES = { graceUntil: 11 * 60, freeUntil: 11 * 60 + 15, freeTimes: 2, halfDayFrom: 12 * 60, firstPct: 10, stepPct: 5, capDays: 5 };
const ABSENCE_DAYS = [1, 2, 3]; // 1st, 2nd, 3rd+ absence in the month

// Confirmed deduction days for one person in a month (for payroll)
function deductionDaysFor(rows, userId, month) {
  return round2((rows || []).filter((r) => r.user_id === userId && r.status === "confirmed" && String(r.day).startsWith(month)).reduce((s, r) => s + num(r.days), 0));
}

// Works out every late/absent day of a person in a month, with the suggested deduction, and the saved decision if any
function computeDeductions({ userId, month, attendance, leaves, decisions, settings, exempt = false, latePerms = [] }) {
  const today = todayCairo();
  // no attendance needed for this person: only manual deductions count
  if (exempt) return decisions.filter((x) => x.user_id === userId && x.kind === "manual" && String(x.day).startsWith(month)).map((x) => ({ day: x.day, kind: "manual", label: x.note || "Manual deduction", suggested: num(x.days), decision: x }));
  // approved late permission: that day's lateness (until the agreed time) is not deducted and not counted
  const permitted = (d, t) => latePerms.some((l) => l.user_id === userId && l.status === "approved" && l.day === d && (!l.until_time || t <= hmToMin(l.until_time) + 5));
  const wd = workDaysOf(settings);
  const mine = attendance.filter((a) => a.userId === userId);
  const firstEver = mine.reduce((m, a) => { const d = cairoParts(a.checkedInAt).day; return !m || d < m ? d : m; }, null);
  const inByDay = {};
  mine.forEach((a) => { const p = cairoParts(a.checkedInAt); if (!inByDay[p.day] || p.minutes < inByDay[p.day]) inByDay[p.day] = p.minutes; });
  const onLeave = (d) => leaves.some((l) => l.user_id === userId && l.status === "approved" && l.from_date <= d && l.to_date >= d);
  const dec = (d, kind) => decisions.find((x) => x.user_id === userId && x.day === d && x.kind === kind);
  const rows = [];
  let free = 0, lateN = 0, lateDays = 0, absN = 0;
  for (const d of monthDays(month)) {
    if (d > today || !wd.includes(dayOfWeek(d)) || onLeave(d)) continue;
    const t = inByDay[d];
    if (t === undefined) {
      if (d >= today || !firstEver || d < firstEver) continue;
      const x = dec(d, "absent");
      if (x && x.status === "excused") { rows.push({ day: d, kind: "absent", label: "Absent", suggested: 0, decision: x }); continue; }
      const sug = ABSENCE_DAYS[Math.min(absN, ABSENCE_DAYS.length - 1)]; absN++;
      rows.push({ day: d, kind: "absent", label: `Absent (#${absN})`, suggested: sug, decision: x });
      continue;
    }
    if (t <= LATE_RULES.graceUntil) continue;
    if (permitted(d, t)) { rows.push({ day: d, kind: "late", time: t, label: `In at ${hm(t)} · late permission`, suggested: 0, permission: true }); continue; }
    const x = dec(d, "late");
    if (x && x.status === "excused") { rows.push({ day: d, kind: "late", time: t, label: `In at ${hm(t)} · excused`, suggested: 0, decision: x }); continue; }
    if (t <= LATE_RULES.freeUntil && free < LATE_RULES.freeTimes) { free++; rows.push({ day: d, kind: "late", time: t, label: `In at ${hm(t)} · free (${free}/${LATE_RULES.freeTimes})`, suggested: 0, free: true }); continue; }
    let sug = t >= LATE_RULES.halfDayFrom ? 0.5 : (LATE_RULES.firstPct + LATE_RULES.stepPct * lateN) / 100;
    lateN++;
    sug = Math.max(0, Math.min(sug, LATE_RULES.capDays - lateDays));
    lateDays = round2(lateDays + sug);
    rows.push({ day: d, kind: "late", time: t, label: `In at ${hm(t)} · late #${lateN}${t >= LATE_RULES.halfDayFrom ? " (after 12:00)" : ""}`, suggested: round2(sug), decision: x });
  }
  decisions.filter((x) => x.user_id === userId && x.kind === "manual" && String(x.day).startsWith(month))
    .forEach((x) => rows.push({ day: x.day, kind: "manual", label: x.note || "Manual deduction", suggested: num(x.days), decision: x }));
  return rows.sort((a, b) => (a.day < b.day ? -1 : 1));
}

function DeductionsPage({ profile, users, visibleSalesIds, attendance, fin, getToken, refreshFinance }) {
  const [month, setMonth] = useState(() => todayCairo().slice(0, 7));
  const [data, setData] = useState({ leaves: [], decisions: [], loaded: false });
  const [open, setOpen] = useState(null);
  const [busy, setBusy] = useState(false);
  const [manual, setManual] = useState(null);
  const admin = isFinanceAdmin(profile);
  const manager = admin || profile.role !== "sales_agent";
  const load = async () => {
    const t = await getToken();
    let failed = "";
    const [leaves, decisions, latePerms] = await Promise.all([
      db.selectAll("leave_requests", `&status=eq.approved&to_date=gte.${month}-01`, t).catch((e) => { failed = e.message; return []; }),
      db.selectAll("deduction_decisions", `&day=gte.${month}-01&day=lt.${addDays(`${month}-28`, 7).slice(0, 7)}-01`, t).catch((e) => { failed = e.message; return []; }),
      db.selectAll("late_permissions", `&status=eq.approved&day=gte.${month}-01`, t).catch(() => []),
    ]);
    setData({ leaves: leaves || [], decisions: decisions || [], latePerms: latePerms || [], loaded: true, error: failed });
  };
  useEffect(() => { load(); }, [month]); // eslint-disable-line
  const people = manager ? staffOf(users).filter((u) => admin || (visibleSalesIds.includes(u.id) && u.id !== profile.id)) : [profile];
  const salaryOf = (id) => num((fin.salaries || []).find((s) => s.user_id === id)?.monthly_salary);
  const decide = async (u, r, status, days, note) => {
    setBusy(true);
    try {
      const t = await getToken();
      const row = { user_id: u.id, day: r.day, kind: r.kind, status, days: status === "excused" ? 0 : round2(days), decided_by: profile.id, decided_at: new Date().toISOString(), note: note !== undefined ? note : r.decision?.note || null };
      if (r.decision) await db.update("deduction_decisions", r.decision.id, row, t); else await db.insert("deduction_decisions", row, t);
      await load(); if (refreshFinance) refreshFinance();
    } catch (e) { window.alert(e.message); } finally { setBusy(false); }
  };
  const undo = async (r) => { setBusy(true); try { await db.remove("deduction_decisions", r.decision.id, await getToken()); await load(); if (refreshFinance) refreshFinance(); } catch (e) { window.alert(e.message); } finally { setBusy(false); } };
  const months = [0, 1, 2, 3].map((k) => { const d = new Date(`${todayCairo().slice(0, 7)}-15T12:00:00Z`); d.setUTCMonth(d.getUTCMonth() - k); return d.toISOString().slice(0, 7); });
  return (
    <div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
        <select value={month} onChange={(e) => setMonth(e.target.value)} style={{ ...inputStyle, width: "auto" }}>{months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}</select>
        <span style={{ fontSize: 12, color: COLORS.textMuted }}>Grace until 11:00 · 2 free late arrivals until 11:15 · then 10%, 15%, 20%… of a day · from 12:00 half a day · max 5 days/month for lateness · absence 1, 2, 3 days</span>
      </div>
      {data.error && <div style={{ color: COLORS.danger, fontSize: 12.5, marginBottom: 8 }}>Couldn't load saved decisions: {data.error}</div>}
      {!data.loaded ? <div style={{ color: COLORS.textMuted }}>Loading…</div> : people.map((u) => {
        const rows = computeDeductions({ userId: u.id, month, attendance, leaves: data.leaves, decisions: data.decisions, settings: fin.settings, exempt: !!u.attendanceExempt, latePerms: data.latePerms || [] });
        const visible = manager ? rows : rows.filter((r) => r.decision?.status === "confirmed");
        const confirmed = round2(rows.filter((r) => r.decision?.status === "confirmed").reduce((s, r) => s + num(r.decision.days), 0));
        const waiting = rows.filter((r) => !r.decision && r.suggested > 0);
        const sal = salaryOf(u.id);
        return (
          <div key={u.id} className="card" style={{ padding: 12, marginBottom: 10 }}>
            <div onClick={() => setOpen(open === u.id ? null : u.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", gap: 8 }}>
              <div style={{ fontWeight: 800, color: COLORS.navy }}>{u.name}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                {manager && waiting.length > 0 && <Badge tone="pending">{waiting.length} to review</Badge>}
                <Badge tone={confirmed > 0 ? "hold" : "active"}>{confirmed > 0 ? `− ${confirmed} day${confirmed === 1 ? "" : "s"}${sal ? ` · ${egp(confirmed * sal / 30)}` : ""}` : "No deductions"}</Badge>
              </div>
            </div>
            {(open === u.id || !manager) && (
              <div style={{ marginTop: 10 }}>
                {visible.length === 0 && <div style={{ fontSize: 12.5, color: COLORS.textMuted }}>Nothing this month.</div>}
                {visible.map((r) => (
                  <div key={r.day + r.kind + (r.decision?.id || "")} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "7px 0", borderTop: `1px solid ${COLORS.border}`, flexWrap: "wrap" }}>
                    <div style={{ fontSize: 13 }}><b>{formatDate(r.day)}</b> · {r.label}{r.decision?.note && r.kind !== "manual" ? ` · ${r.decision.note}` : ""}</div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      {r.free ? <Badge tone="neutral">free</Badge> : r.decision ? (
                        <>
                          <Badge tone={r.decision.status === "excused" ? "active" : "hold"}>{r.decision.status === "excused" ? "Excused" : `− ${num(r.decision.days)} day`}</Badge>
                          {manager && <button style={{ ...btnGhost, padding: "4px 10px" }} disabled={busy} onClick={() => undo(r)}>Undo</button>}
                        </>
                      ) : manager && (
                        <>
                          <span style={{ fontSize: 12, color: COLORS.textMuted }}>suggested − {r.suggested} day</span>
                          <button style={{ ...btnPrimary, padding: "4px 10px" }} disabled={busy} onClick={() => decide(u, r, "confirmed", r.suggested)}>Confirm</button>
                          <button style={{ ...btnGhost, padding: "4px 10px" }} disabled={busy} onClick={() => { const v = window.prompt("Deduction in days (e.g. 0.25):", String(r.suggested)); if (v !== null && !isNaN(Number(v))) decide(u, r, "confirmed", Number(v)); }}>Edit</button>
                          <button style={{ ...btnGhost, padding: "4px 10px" }} disabled={busy} onClick={() => { const why = window.prompt("Why excused? (e.g. asked permission)", "Asked permission"); if (why !== null) decide(u, r, "excused", 0, why.trim() || "Excused"); }}>Excuse</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {manager && waiting.length > 1 && <button style={{ ...btnPrimary, marginTop: 8, marginInlineEnd: 6 }} disabled={busy} onClick={async () => {
                  if (!window.confirm(`Confirm all ${waiting.length} suggested deductions for ${u.name}?`)) return;
                  setBusy(true);
                  try { const t = await getToken(); for (const r of waiting) await db.insert("deduction_decisions", { user_id: u.id, day: r.day, kind: r.kind, status: "confirmed", days: r.suggested, decided_by: profile.id }, t); await load(); if (refreshFinance) refreshFinance(); }
                  catch (e) { window.alert(e.message); } finally { setBusy(false); }
                }}>Confirm all ({waiting.length})</button>}
                {manager && (manual === u.id ? (
                  <ManualDeduction onCancel={() => setManual(null)} onSave={async (day, days, note) => {
                    setBusy(true);
                    try { await db.insert("deduction_decisions", { user_id: u.id, day, kind: "manual", status: "confirmed", days, note, decided_by: profile.id }, await getToken()); setManual(null); await load(); if (refreshFinance) refreshFinance(); }
                    catch (e) { window.alert(e.message); } finally { setBusy(false); }
                  }} />
                ) : <button style={{ ...btnGhost, marginTop: 8 }} onClick={() => setManual(u.id)}>+ Manual deduction</button>)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
function ManualDeduction({ onSave, onCancel }) {
  const [day, setDay] = useState(todayCairo());
  const [days, setDays] = useState("1");
  const [note, setNote] = useState("");
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginTop: 8, alignItems: "end" }}>
      <Field label="Day"><input type="date" value={day} onChange={(e) => setDay(e.target.value)} style={inputStyle} /></Field>
      <Field label="Days of pay"><input value={days} onChange={(e) => setDays(e.target.value)} inputMode="decimal" style={inputStyle} /></Field>
      <Field label="Reason (shown to the employee)"><input value={note} onChange={(e) => setNote(e.target.value)} style={inputStyle} placeholder="e.g. Left early without permission" /></Field>
      <div style={{ display: "flex", gap: 6 }}>
        <button style={btnPrimary} disabled={!note.trim() || !(Number(days) > 0)} onClick={() => onSave(day, round2(Number(days)), note.trim())}>Save</button>
        <button style={btnGhost} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

// ---------- leave ----------
function LeavePage({ profile, users, visibleSalesIds, fin, getToken }) {
  const [rows, setRows] = useState(null);
  const [form, setForm] = useState({ from: "", to: "", kind: "annual", reason: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const yearly = num(fin.settings?.annual_leave_days) || 15;
  const year = todayCairo().slice(0, 4);
  const load = async () => { try { setRows(await db.selectAll("leave_requests", "&order=from_date.desc", await getToken())); } catch (e) { setRows([]); } };
  useEffect(() => { load(); }, []); // eslint-disable-line
  const used = (uid) => (rows || []).filter((r) => r.user_id === uid && r.kind === "annual" && r.status === "approved" && String(r.from_date).startsWith(year)).reduce((s, r) => s + num(r.days), 0);
  const nm = (id) => users.find((u) => u.id === id)?.name || "—";
  const team = (rows || []).filter((r) => r.user_id !== profile.id);
  const days = form.from && form.to && form.to >= form.from ? workDaysBetween(form.from, form.to, fin.settings) : 0;
  const decide = async (r, status) => { setBusy(true); try { await db.update("leave_requests", r.id, { status, decided_by: profile.id, decided_at: new Date().toISOString() }, await getToken()); await load(); } catch (e) { window.alert(e.message); } finally { setBusy(false); } };
  const isStaff = !["admin", "ceo"].includes(profile.role);
  const statusTone = { pending: "pending", approved: "active", rejected: "hold" };
  return (
    <div>
      {isStaff && (
        <div className="card" style={{ padding: 14, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
            <div style={{ fontWeight: 800, color: COLORS.navy }}>Ask for leave</div>
            <Badge tone="active">{round2(yearly - used(profile.id))} of {yearly} days left in {year}</Badge>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8, marginTop: 10 }}>
            <Field label="From"><input type="date" value={form.from} onChange={(e) => setForm({ ...form, from: e.target.value, to: form.to && form.to >= e.target.value ? form.to : e.target.value })} style={inputStyle} /></Field>
            <Field label="To"><input type="date" value={form.to} min={form.from} onChange={(e) => setForm({ ...form, to: e.target.value })} style={inputStyle} /></Field>
            <Field label="Type"><select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })} style={inputStyle}><option value="annual">Annual leave</option><option value="unpaid">Unpaid</option><option value="other">Other</option></select></Field>
            <Field label="Reason"><input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} style={inputStyle} placeholder="optional" /></Field>
          </div>
          {err && <div style={{ color: COLORS.danger, fontSize: 12.5, marginTop: 6 }}>{err}</div>}
          <button style={{ ...btnPrimary, marginTop: 10 }} disabled={busy || !days} onClick={async () => {
            setErr("");
            if (form.kind === "annual" && days > yearly - used(profile.id)) { setErr("Not enough days left — choose Unpaid or fewer days."); return; }
            setBusy(true);
            try { await db.insert("leave_requests", { user_id: profile.id, from_date: form.from, to_date: form.to, days, kind: form.kind, reason: form.reason.trim() || null }, await getToken()); setForm({ from: "", to: "", kind: "annual", reason: "" }); await load(); }
            catch (e) { setErr(e.message || "Couldn't send"); } finally { setBusy(false); }
          }}>{days ? `Send request · ${days} working day${days === 1 ? "" : "s"}` : "Send request"}</button>
        </div>
      )}
      {rows === null ? <div style={{ color: COLORS.textMuted }}>Loading…</div> : (
        <>
          {team.filter((r) => r.status === "pending").length > 0 && <div style={{ fontWeight: 800, color: COLORS.navy, margin: "6px 0" }}>Waiting for you</div>}
          {team.filter((r) => r.status === "pending").map((r) => (
            <div key={r.id} className="card" style={{ padding: 12, marginBottom: 8, display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ fontSize: 13 }}><b>{nm(r.user_id)}</b> · {r.days} day{num(r.days) === 1 ? "" : "s"} · {formatDate(r.from_date)} → {formatDate(r.to_date)} · {r.kind}{r.reason ? ` · ${r.reason}` : ""}<div style={{ fontSize: 12, color: COLORS.textMuted }}>{round2(yearly - used(r.user_id))} annual days left</div></div>
              <div style={{ display: "flex", gap: 6 }}>
                <button style={btnPrimary} disabled={busy} onClick={() => decide(r, "approved")}>Approve</button>
                <button style={btnGhost} disabled={busy} onClick={() => decide(r, "rejected")}>Reject</button>
              </div>
            </div>
          ))}
          <div style={{ fontWeight: 800, color: COLORS.navy, margin: "10px 0 6px" }}>{team.length ? "All requests" : "My requests"}</div>
          {(rows || []).length === 0 && <div style={{ color: COLORS.textMuted, fontSize: 13 }}>No requests yet.</div>}
          {(rows || []).filter((r) => r.status !== "pending" || r.user_id === profile.id).slice(0, 60).map((r) => (
            <div key={r.id} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "8px 0", borderBottom: `1px solid ${COLORS.border}`, fontSize: 13, flexWrap: "wrap" }}>
              <div>{r.user_id !== profile.id && <b>{nm(r.user_id)} · </b>}{formatDate(r.from_date)} → {formatDate(r.to_date)} · {r.days} day{num(r.days) === 1 ? "" : "s"} · {r.kind}{r.reason ? ` · ${r.reason}` : ""}</div>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <Badge tone={statusTone[r.status]}>{r.status}</Badge>
                {r.user_id === profile.id && r.status === "pending" && <button style={{ ...btnGhost, padding: "3px 10px" }} onClick={async () => { await db.remove("leave_requests", r.id, await getToken()); load(); }}>Cancel</button>}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ---------- monthly evaluation ----------
function EvaluationPage({ profile, users, visibleSalesIds, clients, activity, fin, attendance, getToken }) {
  const [month, setMonth] = useState(() => todayCairo().slice(0, 7));
  const [evals, setEvals] = useState([]);
  const [rank, setRank] = useState([]);
  const [edit, setEdit] = useState(null);
  const admin = isFinanceAdmin(profile);
  const manager = admin || profile.role !== "sales_agent";
  const people = manager ? staffOf(users).filter((u) => admin || (visibleSalesIds.includes(u.id) && u.id !== profile.id)) : [profile];
  const from = new Date(`${month}-01T00:00:00+02:00`); const to = new Date(from); to.setMonth(to.getMonth() + 1);
  const load = async () => {
    const t = await getToken();
    setEvals(await db.select("evaluations", `&month=eq.${month}`, t).catch(() => []) || []);
    setRank(await db.rpc("sales_ranking", { p_from: from.toISOString(), p_to: to.toISOString() }, t).catch(() => []) || []);
  };
  useEffect(() => { load(); }, [month]); // eslint-disable-line
  const inM = (iso) => iso && new Date(iso) >= from && new Date(iso) < to;
  const months = [0, 1, 2, 3, 4, 5].map((k) => { const d = new Date(`${todayCairo().slice(0, 7)}-15T12:00:00Z`); d.setUTCMonth(d.getUTCMonth() - k); return d.toISOString().slice(0, 7); });
  const metrics = (uid) => {
    const r = rank.find((x) => x.user_id === uid) || {};
    const acts = activity.filter((a) => a.changedBy === uid && inM(a.changedAt));
    const myDeals = (fin.deals || []).filter((d) => d.status === "approved" && inM(d.done_at || d.reviewed_at || d.created_at) && (fin.dealAgents || []).some((a) => a.deal_id === d.id && a.agent_id === uid));
    const lates = new Set(attendance.filter((a) => a.userId === uid && inM(a.checkedInAt) && cairoParts(a.checkedInAt).minutes > LATE_RULES.graceUntil).map((a) => cairoParts(a.checkedInAt).day)).size;
    return [
      ["Calls (by feedback)", r.calls ?? "—"], ["New clients", clients.filter((c) => c.assignedTo === uid && inM(c.createdAt)).length],
      ["Meetings booked", acts.filter((a) => a.action === "quick_reply" && a.fieldName === "meeting_set").length], ["Meetings done", acts.filter((a) => a.action === "quick_reply" && a.fieldName === "meeting_done").length],
      ["Deals done", myDeals.length], ["Units added", r.units_added ?? "—"], ["Late days (after 11:00)", lates],
    ];
  };
  return (
    <div>
      <select value={month} onChange={(e) => setMonth(e.target.value)} style={{ ...inputStyle, width: "auto", marginBottom: 10 }}>{months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}</select>
      {people.map((u) => {
        const ev = evals.find((e) => e.user_id === u.id);
        return (
          <div key={u.id} className="card" style={{ padding: 12, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <div style={{ fontWeight: 800, color: COLORS.navy }}>{u.name}</div>
              {ev?.rating ? <Badge tone={ev.rating >= 4 ? "active" : ev.rating >= 3 ? "neutral" : "hold"}>{"★".repeat(ev.rating)}{"☆".repeat(5 - ev.rating)}</Badge> : <Badge tone="pending">Not rated</Badge>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 6, marginTop: 8 }}>
              {metrics(u.id).map(([k, v]) => <div key={k} style={{ background: COLORS.cream, borderRadius: 10, padding: "6px 8px" }}><div style={{ fontSize: 11, color: COLORS.textMuted }}>{k}</div><div style={{ fontWeight: 800, color: COLORS.navy }}>{v}</div></div>)}
            </div>
            {ev && edit !== u.id && (
              <div style={{ fontSize: 13, marginTop: 8, lineHeight: 1.6 }}>
                {ev.strengths && <div><b>Doing well:</b> {ev.strengths}</div>}
                {ev.improve && <div><b>To improve:</b> {ev.improve}</div>}
                {ev.goals && <div><b>Goals next month:</b> {ev.goals}</div>}
              </div>
            )}
            {manager && (edit === u.id ? (
              <EvalForm ev={ev} onCancel={() => setEdit(null)} onSave={async (v) => {
                try { await db.upsert("evaluations", { user_id: u.id, month, ...v, by_user: profile.id, updated_at: new Date().toISOString() }, "user_id,month", await getToken()); setEdit(null); load(); }
                catch (e) { window.alert(e.message); }
              }} />
            ) : <button style={{ ...btnGhost, marginTop: 8 }} onClick={() => setEdit(u.id)}>{ev ? "Edit evaluation" : "Write evaluation"}</button>)}
          </div>
        );
      })}
    </div>
  );
}
function EvalForm({ ev, onSave, onCancel }) {
  const [v, setV] = useState({ rating: ev?.rating || 0, strengths: ev?.strengths || "", improve: ev?.improve || "", goals: ev?.goals || "" });
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>{[1, 2, 3, 4, 5].map((n) => <button key={n} onClick={() => setV({ ...v, rating: n })} style={{ border: "none", background: "none", fontSize: 24, cursor: "pointer", color: n <= v.rating ? COLORS.gold : COLORS.border }}>★</button>)}</div>
      {[["strengths", "Doing well"], ["improve", "To improve"], ["goals", "Goals next month"]].map(([k, l]) => (
        <Field key={k} label={l}><textarea value={v[k]} onChange={(e) => setV({ ...v, [k]: e.target.value })} rows={2} style={{ ...inputStyle, resize: "vertical" }} /></Field>
      ))}
      <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
        <button style={btnPrimary} disabled={!v.rating} onClick={() => onSave({ rating: v.rating, strengths: v.strengths.trim() || null, improve: v.improve.trim() || null, goals: v.goals.trim() || null })}>Save</button>
        <button style={btnGhost} onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

// ---------- onboarding (first 30 days) ----------
const ONBOARDING_ITEMS = [
  { id: "contract", label: "Signed the employment contract (paper)" },
  { id: "policies", label: "Read & accepted the work regulation on the CRM" },
  { id: "line", label: "Got the company phone line / WhatsApp" },
  { id: "crm", label: "CRM walkthrough: clients, units, cold calls" },
  { id: "projects", label: "Product training: our compounds & projects" },
  { id: "scripts", label: "Learned the call & meeting scripts" },
  { id: "shadow", label: "Attended 3 meetings with a senior" },
  { id: "cold", label: "Finished the first cold-call sheet" },
  { id: "meeting", label: "Did the first client meeting alone" },
  { id: "review", label: "30-day review with the manager" },
];
function OnboardingPage({ profile, users, visibleSalesIds, getToken }) {
  const [rows, setRows] = useState([]);
  const [who, setWho] = useState("");
  const admin = isFinanceAdmin(profile);
  const manager = admin || profile.role !== "sales_agent";
  const people = manager ? staffOf(users).filter((u) => admin || (visibleSalesIds.includes(u.id) && u.id !== profile.id)) : [profile];
  const load = async () => setRows(await db.select("onboarding", "", await getToken()).catch(() => []) || []);
  useEffect(() => { load(); }, []); // eslint-disable-line
  const sel = manager ? people.find((u) => u.id === who) : profile;
  const items = rows.find((r) => r.user_id === sel?.id)?.items || {};
  const toggle = async (id) => {
    const next = { ...items }; if (next[id]) delete next[id]; else next[id] = todayCairo();
    try { await db.upsert("onboarding", { user_id: sel.id, items: next, updated_at: new Date().toISOString() }, "user_id", await getToken()); load(); } catch (e) { window.alert(e.message); }
  };
  return (
    <div>
      {manager && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
          {people.map((u) => { const done = Object.keys(rows.find((r) => r.user_id === u.id)?.items || {}).length; return (
            <button key={u.id} className="chip" onClick={() => setWho(u.id)} style={{ border: `1px solid ${who === u.id ? COLORS.navy : COLORS.border}`, background: who === u.id ? COLORS.navy : "#fff", color: who === u.id ? "#fff" : COLORS.text, borderRadius: 999, padding: "6px 12px", fontSize: 12.5, cursor: "pointer" }}>{u.name} · {done}/{ONBOARDING_ITEMS.length}</button>
          ); })}
        </div>
      )}
      {!sel ? <div style={{ color: COLORS.textMuted, fontSize: 13 }}>Choose a person.</div> : (
        <div className="card" style={{ padding: 14 }}>
          <div style={{ fontWeight: 800, color: COLORS.navy, marginBottom: 8 }}>{sel.name} — first 30 days · {Object.keys(items).length}/{ONBOARDING_ITEMS.length}</div>
          {ONBOARDING_ITEMS.map((it) => (
            <label key={it.id} style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 0", borderTop: `1px solid ${COLORS.border}`, fontSize: 13.5, cursor: manager ? "pointer" : "default" }}>
              <input type="checkbox" checked={!!items[it.id]} disabled={!manager} onChange={() => toggle(it.id)} />
              <span style={{ flex: 1, textDecoration: items[it.id] ? "line-through" : "none", color: items[it.id] ? COLORS.textMuted : COLORS.text }}>{it.label}</span>
              {items[it.id] && <span style={{ fontSize: 11.5, color: COLORS.textMuted }}>{formatDate(items[it.id])}</span>}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- deal checklist ----------
const DEAL_STEPS = [
  { id: "reservation", label: "Reservation / deposit received" },
  { id: "docs_seller", label: "Seller's papers collected (contract, receipts, IDs)" },
  { id: "developer", label: "Developer clearance & transfer fees checked" },
  { id: "promise", label: "Promise of sale signed" },
  { id: "payment", label: "Remaining payment done" },
  { id: "transfer", label: "Transfer (تنازل) done at the developer" },
  { id: "keys", label: "Keys handed over" },
  { id: "commission", label: "Our commission collected" },
];
function DealChecklist({ deal, getToken, profile }) {
  const [items, setItems] = useState(null);
  useEffect(() => { (async () => { const r = await db.select("deal_checklists", `&deal_id=eq.${deal.id}`, await getToken()).catch(() => []); setItems((r && r[0]?.items) || {}); })(); }, [deal.id]); // eslint-disable-line
  if (!items) return null;
  const toggle = async (id) => {
    const next = { ...items }; if (next[id]) delete next[id]; else next[id] = todayCairo();
    setItems(next);
    try { await db.upsert("deal_checklists", { deal_id: deal.id, items: next, updated_by: profile.id, updated_at: new Date().toISOString() }, "deal_id", await getToken()); } catch (e) { window.alert(e.message); }
  };
  const done = Object.keys(items).length;
  return (
    <div className="card" style={{ padding: 14, marginTop: 12 }}>
      <div style={{ fontWeight: 800, color: COLORS.navy, marginBottom: 6 }}>Deal checklist · {done}/{DEAL_STEPS.length}</div>
      {DEAL_STEPS.map((s) => (
        <label key={s.id} style={{ display: "flex", gap: 10, alignItems: "center", padding: "7px 0", borderTop: `1px solid ${COLORS.border}`, fontSize: 13.5, cursor: "pointer" }}>
          <input type="checkbox" checked={!!items[s.id]} onChange={() => toggle(s.id)} />
          <span style={{ flex: 1, color: items[s.id] ? COLORS.textMuted : COLORS.text }}>{s.label}</span>
          {items[s.id] && <span style={{ fontSize: 11.5, color: COLORS.textMuted }}>{formatDate(items[s.id])}</span>}
        </label>
      ))}
    </div>
  );
}

// ---------- compare units for a client (printable) ----------
function CompareUnits({ units, getProjectInfo }) {
  const [picked, setPicked] = useState([]);
  const [q, setQ] = useState("");
  const [rent, setRent] = useState({});
  const [client, setClient] = useState("");
  const pool = units.filter((u) => u.status === "active" && u.listingType !== "rent" && num(u.totalPrice) > 0);
  const label = (u) => `${u.type || "Unit"} ${u.unitNumber || ""} · ${getProjectInfo(u).name}`;
  const hits = q.trim() ? pool.filter((u) => !picked.includes(u.id) && label(u).toLowerCase().includes(q.trim().toLowerCase())).slice(0, 8) : [];
  const sel = picked.map((id) => units.find((u) => u.id === id)).filter(Boolean);
  const rows = (u) => {
    const p = num(u.totalPrice), area = num(u.bua) || num(u.landArea), r = num(rent[u.id]);
    return {
      Project: getProjectInfo(u).name, Area: getProjectInfo(u).destination, Type: u.type || "—", "Unit": u.unitNumber || "—",
      "Built-up area (m²)": area || "—", Bedrooms: u.bedrooms || "—", Finishing: u.finishing || "—", Delivery: u.deliveryDate || "—",
      "Total price (EGP)": egpFull(p), "Price per m²": area ? egpFull(Math.round(p / area)) : "—",
      "vs same project & type": (() => { const pi = unitPriceInfo(u, units); return !pi || pi.median === null ? "—" : pi.good ? `Good price −${pi.belowPct}% (median ${egpFull(pi.median)}/m²)` : `${pi.belowPct >= 0 ? "−" : "+"}${Math.abs(pi.belowPct)}% vs median ${egpFull(pi.median)}/m²`; })(),
      "Down payment": num(u.downpayment) ? egpFull(u.downpayment) : "—", Remaining: num(u.remaining) ? egpFull(u.remaining) : "—",
      "Expected monthly rent": r ? egpFull(r) : "—", "Rental yield / year": r ? `${round2((r * 12 * 100) / p)}%` : "—",
    };
  };
  const keys = sel.length ? Object.keys(rows(sel[0])) : [];
  const print = () => {
    const w = window.open("", "_blank"); if (!w) return;
    const esc = (x) => String(x).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Unit comparison</title><style>body{font-family:system-ui,sans-serif;color:#0E1830;padding:28px}h1{font-size:20px;margin:0 0 4px}p{color:#5b6478;margin:0 0 18px;font-size:13px}table{border-collapse:collapse;width:100%;font-size:13px}th,td{border:1px solid #E5DFD3;padding:8px 10px;text-align:left}th{background:#F6F4EF;width:200px}td{font-weight:600}.f{margin-top:22px;font-size:11.5px;color:#5b6478}</style></head><body>
      <h1>Unit comparison${client ? ` — prepared for ${esc(client)}` : ""}</h1><p>Origin Real Estate · ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
      <table>${keys.map((k) => `<tr><th>${esc(k)}</th>${sel.map((u) => `<td>${esc(rows(u)[k])}</td>`).join("")}</tr>`).join("")}</table>
      <div class="f">Prices and availability can change. Rental yield is an estimate based on the expected rent above.</div>
      <script>setTimeout(function(){window.print()},300)</script></body></html>`);
    w.document.close();
  };
  return (
    <div>
      <div className="card" style={{ padding: 14, marginBottom: 12 }}>
        <div style={{ fontWeight: 800, color: COLORS.navy, marginBottom: 6 }}>Compare up to 3 units for a client</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
          <Field label="Client name (optional)"><input value={client} onChange={(e) => setClient(e.target.value)} style={inputStyle} /></Field>
          <Field label="Find a unit"><input value={q} onChange={(e) => setQ(e.target.value)} disabled={picked.length >= 3} placeholder={picked.length >= 3 ? "3 units chosen" : "Project, type or unit number"} style={inputStyle} /></Field>
        </div>
        {hits.map((u) => <div key={u.id} onClick={() => { setPicked([...picked, u.id]); setQ(""); }} style={{ padding: "7px 4px", borderBottom: `1px solid ${COLORS.border}`, cursor: "pointer", fontSize: 13 }}>{label(u)} · {egp(u.totalPrice)}</div>)}
      </div>
      {sel.length > 0 && (
        <div className="card" style={{ padding: 14 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            {sel.map((u) => (
              <div key={u.id} style={{ background: COLORS.cream, borderRadius: 10, padding: 8, fontSize: 12.5 }}>
                <b>{label(u)}</b> <button onClick={() => setPicked(picked.filter((x) => x !== u.id))} style={{ border: "none", background: "none", cursor: "pointer", color: COLORS.danger }}>✕</button>
                <div style={{ marginTop: 4 }}><MoneyInput value={rent[u.id] || ""} onChange={(v) => setRent({ ...rent, [u.id]: v })} placeholder="Expected rent / month" /></div>
              </div>
            ))}
          </div>
          <TableWrap><tbody>{keys.map((k) => <tr key={k}><th style={thStyle}>{k}</th>{sel.map((u) => <td key={u.id} style={tdStyle}>{rows(u)[k]}</td>)}</tr>)}</tbody></TableWrap>
          <button style={{ ...btnPrimary, marginTop: 10 }} onClick={print}>Print / save as PDF</button>
        </div>
      )}
    </div>
  );
}

// ---------- unit price vs the same project + type ----------
// price per m² compared with the median of the other active units of the same project and type (needs ≥ 2 others)
const unitArea = (u) => num(u.bua) || num(u.landArea);
const medianOf = (a) => { const s = [...a].sort((x, y) => x - y); const m = Math.floor(s.length / 2); return s.length ? (s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2) : 0; };
function unitPriceInfo(u, units) {
  if (!u || u.status !== "active" || u.listingType === "rent" || !(num(u.totalPrice) > 0) || !unitArea(u)) return null;
  const ppm = num(u.totalPrice) / unitArea(u);
  const peers = (units || []).filter((x) => x.id !== u.id && x.status === "active" && x.listingType !== "rent" && x.projectId === u.projectId && x.type === u.type && num(x.totalPrice) > 0 && unitArea(x)).map((x) => num(x.totalPrice) / unitArea(x));
  if (peers.length < 2) return { ppm: Math.round(ppm), median: null, peers: peers.length, belowPct: null, good: false };
  const med = medianOf(peers);
  const below = Math.round(((med - ppm) / med) * 100);
  return { ppm: Math.round(ppm), median: Math.round(med), peers: peers.length, belowPct: below, good: below >= 10 };
}
function GoodPriceBadge({ unit, units, full }) {
  const p = useMemo(() => unitPriceInfo(unit, units), [unit, units]);
  if (!p || (!p.good && !full)) return null;
  if (!p.good) return p.median ? <span style={{ fontSize: 12, color: COLORS.textMuted }}>{egpFull(p.ppm)}/m² · project median {egpFull(p.median)}/m²</span> : null;
  return <span data-good-price title={`${egpFull(p.ppm)}/m² vs median ${egpFull(p.median)}/m² of ${p.peers} similar units`} style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#E7F6EC", color: "#13703A", borderRadius: 999, padding: "2px 9px", fontSize: 11.5, fontWeight: 800, whiteSpace: "nowrap" }}>Good price −{p.belowPct}%{full ? ` · ${egpFull(p.ppm)}/m² vs ${egpFull(p.median)}` : ""}</span>;
}

// ---------- planning (admin): AI analyst, pipeline by transfer date, runway, cash flow, profit share, hiring, commission what-if ----------
const monthAdd = (key, k) => { const [y, m] = key.split("-").map(Number); const d = new Date(Date.UTC(y, m - 1 + k, 15)); return d.toISOString().slice(0, 7); };
function planningNumbers({ fin, clients, activity, users }) {
  const now = new Date();
  const mk = (d) => monthKeyOf(d);
  const lastMonths = (n) => [...Array(n)].map((_, k) => { const d = new Date(now.getFullYear(), now.getMonth() - k, 15); return mk(d); });
  const txns = fin.txns || [];
  const balances = (fin.accounts || []).filter((a) => !a.archived).map((a) => ({ name: a.name, balance: round2(txns.filter((t) => t.account_id === a.id).reduce((s, t) => s + (t.direction === "in" ? 1 : -1) * num(t.amount), 0)) }));
  const cash = round2(balances.reduce((s, b) => s + b.balance, 0));
  const salaries = round2((fin.salaries || []).filter((s) => num(s.monthly_salary) > 0 && users.some((u) => u.id === s.user_id && u.role !== "pending")).reduce((s, r) => s + num(r.monthly_salary), 0));
  const recurring = round2((fin.recurring || []).filter((r) => !r.archived).reduce((s, r) => s + num(r.default_amount), 0));
  const fixed = round2(salaries + recurring);
  const byMonth = lastMonths(6).map((m) => {
    const inM = (iso) => iso && mk(iso) === m;
    const tx = txns.filter((t) => inM(t.occurred_at));
    const sumK = (f) => round2(tx.filter(f).reduce((s, t) => s + num(t.amount), 0));
    const newClients = clients.filter((c) => inM(c.createdAt));
    const bySource = {}; newClients.forEach((c) => { const k = SOURCE_LABEL[c.source] || c.source || "Unknown"; bySource[k] = (bySource[k] || 0) + 1; });
    return {
      month: m, newClients: newClients.length, bySource,
      meetings: activity.filter((a) => a.action === "quick_reply" && a.fieldName === "meeting_set" && inM(a.changedAt)).length,
      dealsDone: (fin.deals || []).filter((d) => d.status === "approved" && inM(d.done_at || d.reviewed_at)).length,
      commissionIn: sumK((t) => t.kind === "commission_in"), payouts: sumK((t) => t.kind === "payout"), salariesPaid: sumK((t) => t.kind === "salary"),
      expenses: sumK((t) => t.kind === "expense"), adSpend: round2((fin.campaignSpend || []).filter((c) => String(c.month).slice(0, 7) === m).reduce((s, c) => s + num(c.amount), 0)),
    };
  });
  // what the sales are still owed (earned but not paid) + what reserved deals will owe them
  const thresholds = (fin.settings?.tier_thresholds || [0, 70, 100]).map(num);
  const targets = Object.fromEntries((fin.targets || []).map((t) => [t.user_id, num(t.quarterly_target)]));
  let calc = { lines: [] };
  try { calc = computeFinance({ deals: fin.deals || [], dealAgents: fin.dealAgents || [], dealRates: fin.dealRates || [], txns, targets, thresholds, charityPct: num(fin.settings?.charity_pct) }); } catch (e) { /* keep empty */ }
  const unpaidCommissions = round2((calc.lines || []).filter((l) => l.remaining > 0).reduce((s, l) => s + l.remaining, 0));
  // net share: payouts ÷ commission collected over 12 months (an approximation when exact rates are missing)
  const yearAgo = new Date(now.getTime() - 365 * MS_DAY).toISOString();
  const in12 = round2(txns.filter((t) => t.kind === "commission_in" && t.occurred_at >= yearAgo).reduce((s, t) => s + num(t.amount), 0));
  const out12 = round2(txns.filter((t) => t.kind === "payout" && t.occurred_at >= yearAgo).reduce((s, t) => s + num(t.amount), 0));
  const payoutRatio = in12 > 0 ? Math.min(0.9, out12 / in12) : 0.5;
  const exactRates = in12 > 0;
  const thisMonth = mk(now);
  const today = now.toISOString().slice(0, 10);
  const pipeline = (fin.deals || []).filter((d) => ["pending", "reserved"].includes(d.status)).map((d) => {
    const due = round2(num(d.commission_total) - num(d.commission_collected));
    const when = d.expected_transfer_date || null;
    const bucket = !when ? "none" : when < today ? "overdue" : when.slice(0, 7) === thisMonth ? "this" : when.slice(0, 7) === monthAdd(thisMonth, 1) ? "next" : "after";
    return { id: d.id, label: d.unit_label || d.client_label || "Deal", due, net: round2(due * (1 - payoutRatio)), status: d.status, when, bucket };
  }).filter((d) => d.due > 0);
  const approved12 = (fin.deals || []).filter((d) => d.status === "approved" && new Date(d.done_at || d.reviewed_at || d.created_at) > new Date(now.getTime() - 365 * MS_DAY));
  const avgDeal = approved12.length ? round2(approved12.reduce((s, d) => s + num(d.commission_total), 0) / approved12.length) : 0;
  return { balances, cash, salaries, recurring, fixed, byMonth, pipeline, avgDeal, dealsPerMonth: round2(approved12.length / 12), unpaidCommissions, payoutRatio, exactRates, runway: fixed > 0 ? round2(cash / fixed) : null, thisMonth };
}

function planningAlerts({ n, clients, activity, users }) {
  const out = [];
  const week = Date.now() - 7 * MS_DAY;
  const leadsWeek = clients.filter((c) => new Date(c.createdAt) > week).length;
  const prior4 = clients.filter((c) => { const t = new Date(c.createdAt).getTime(); return t <= week && t > week - 28 * MS_DAY; }).length / 4;
  if (prior4 >= 3 && leadsWeek < prior4 * 0.7) out.push({ tone: "hold", text: `New leads this week: ${leadsWeek} — ${Math.round((1 - leadsWeek / prior4) * 100)}% below the last 4 weeks' average (${round2(prior4)}).` });
  const lastAct = {}; activity.forEach((a) => { if (!lastAct[a.clientId] || a.changedAt > lastAct[a.clientId]) lastAct[a.clientId] = a.changedAt; });
  const stale = {}; clients.filter((c) => !TERMINAL_STAGES.includes(c.stage) && c.stage !== LONG_TERM_STAGE && new Date(lastAct[c.id] || c.createdAt) < new Date(Date.now() - 7 * MS_DAY)).forEach((c) => { stale[c.assignedTo] = (stale[c.assignedTo] || 0) + 1; });
  Object.entries(stale).filter(([, k]) => k >= 10).forEach(([uid, k]) => out.push({ tone: "pending", text: `${users.find((u) => u.id === uid)?.name || "Someone"} has ${k} active clients with no update for 7+ days.` }));
  if (n.fixed > 0 && n.cash < n.fixed * 2) out.push({ tone: "hold", text: `Cash (${egpFull(n.cash)}) covers less than 2 months of fixed costs (${egpFull(n.fixed)} / month).` });
  const overdue = n.pipeline.filter((p) => p.bucket === "overdue");
  if (overdue.length) out.push({ tone: "hold", text: `${overdue.length} reserved deal${overdue.length === 1 ? " is" : "s are"} past the expected transfer date.` });
  const noDate = n.pipeline.filter((p) => p.bucket === "none" && p.status === "reserved");
  if (noDate.length) out.push({ tone: "pending", text: `${noDate.length} reserved deal${noDate.length === 1 ? " has" : "s have"} no expected transfer date.` });
  const [m0, m1] = [n.byMonth[1], n.byMonth[2]];
  const cpl = (m) => (m && m.adSpend > 0 && m.newClients > 0 ? m.adSpend / m.newClients : 0);
  if (cpl(m0) && cpl(m1) && cpl(m0) > cpl(m1) * 1.3) out.push({ tone: "pending", text: `Cost per lead went up ${Math.round((cpl(m0) / cpl(m1) - 1) * 100)}% in ${monthLabel(m0.month)} (${egpFull(Math.round(cpl(m0)))} vs ${egpFull(Math.round(cpl(m1)))}).` });
  if (!out.length) out.push({ tone: "active", text: "Nothing worrying right now." });
  return out;
}

// AI analysis card: run now (admin / CEO), latest report, history. Weekly report comes by itself every Sunday.
function AiAnalystCard({ getToken }) {
  const [rows, setRows] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const load = async () => { try { const r = await db.select("ai_reports", "&order=created_at.desc&limit=20", await getToken()); setRows(r || []); setOpenId((o) => o || (r || []).find((x) => x.status === "done")?.id || null); } catch (e) { setRows([]); } };
  useEffect(() => { load(); }, []); // eslint-disable-line
  const run = async () => {
    setBusy(true); setErr("");
    try {
      const t = await getToken();
      const res = await fetch(`${SUPABASE_URL}/functions/v1/ai-analyst`, { method: "POST", headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${t}`, "Content-Type": "application/json" }, body: JSON.stringify({ trigger: "manual" }) });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || `Failed (${res.status})`);
      setOpenId(j.id || null); await load();
    } catch (e) { setErr(e.message || "Couldn't run the analysis"); } finally { setBusy(false); }
  };
  const shown = (rows || []).find((r) => r.id === openId);
  return (
    <div className="card" data-ai-card style={{ padding: 14, marginBottom: 12, borderTop: `3px solid ${COLORS.gold}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontWeight: 800, color: COLORS.navy }}>AI analysis</div>
          <div style={{ fontSize: 12, color: COLORS.textMuted }}>Claude reads the company's numbers (no client names or phones) and writes a report + 3-month forecast. Comes by itself every Sunday morning.</div>
        </div>
        <button style={btnPrimary} disabled={busy} onClick={run}>{busy ? "Analyzing… (about a minute)" : "Run now"}</button>
      </div>
      {err && <div style={{ color: COLORS.danger, fontSize: 13, marginTop: 8 }}>{err}</div>}
      {rows === null ? <Skeleton lines={3} /> : !rows.length ? <div style={{ color: COLORS.textMuted, fontSize: 13, marginTop: 10 }}>No reports yet — tap Run now.</div> : (
        <>
          {shown && shown.status === "done" && (
            <div style={{ marginTop: 12, background: COLORS.cream, borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 4 }}>{shown.trigger === "weekly" ? "Weekly report" : "Run by hand"} · {formatDateTime(shown.created_at)}</div>
              <PolicyMd text={shown.report_md || ""} />
            </div>
          )}
          {shown && shown.status === "failed" && <div style={{ color: COLORS.danger, fontSize: 13, marginTop: 8 }}>This run failed: {String(shown.error || "").slice(0, 200)}</div>}
          <div style={{ fontWeight: 700, fontSize: 13, color: COLORS.navy, margin: "12px 0 4px" }}>History</div>
          {rows.map((r) => (
            <div key={r.id} onClick={() => setOpenId(r.id)} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "7px 4px", borderBottom: `1px solid ${COLORS.border}`, cursor: "pointer", fontSize: 13, background: r.id === openId ? COLORS.cream : "transparent" }}>
              <span>{formatDateTime(r.created_at)} · {r.trigger === "weekly" ? "Weekly" : "Manual"}</span>
              <Badge tone={r.status === "done" ? "active" : "hold"}>{r.status === "done" ? "Ready" : "Failed"}</Badge>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function PlanningPage({ profile, users, fin, clients, activity, getToken }) {
  const n = useMemo(() => planningNumbers({ fin, clients, activity, users }), [fin, clients, activity, users]);
  const alerts = planningAlerts({ n, clients, activity, users });
  const [safety, setSafety] = useState("3");
  const [sharePct, setSharePct] = useState("50");
  const [hire, setHire] = useState({ salary: "10000", ramp: "3", keep: "40" });
  const [rates, setRates] = useState(["", "", ""]);
  const sumP = (b, k = "due") => round2(n.pipeline.filter((p) => p.bucket === b).reduce((s, p) => s + p[k], 0));
  const buckets = [["this", "This month"], ["next", "Next month"], ["after", "After"], ["overdue", "Overdue"], ["none", "No date yet"]];
  // cash flow: two scenarios — no sales at all, and reserved deals collected (net) by their expected transfer dates
  const months = [0, 1, 2].map((k) => monthAdd(n.thisMonth, k));
  const inflowFor = (m, k) => round2(n.pipeline.filter((p) => p.status === "reserved" && p.when && (p.when.slice(0, 7) === m || (k === 0 && p.bucket === "overdue"))).reduce((s, p) => s + p.net, 0));
  const flow = months.reduce((acc, m, k) => {
    const prev = acc.length ? acc[acc.length - 1] : { endA: n.cash, endB: n.cash };
    const inB = inflowFor(m, k);
    acc.push({ m, out: n.fixed, endA: round2(prev.endA - n.fixed), inB, endB: round2(prev.endB - n.fixed + inB) });
    return acc;
  }, []);
  const reserve = round2(num(safety) * n.fixed);
  const distributable = Math.max(0, round2(n.cash - reserve - n.unpaidCommissions));
  const keep = num(hire.keep) / 100;
  const dealsToCover = n.avgDeal && keep ? round2(num(hire.salary) / (n.avgDeal * keep)) : 0;
  // commission what-if (last full quarter)
  const q0 = new Date(); const qStart = new Date(q0.getFullYear(), Math.floor(q0.getMonth() / 3) * 3 - 3, 1); const qEnd = new Date(qStart.getFullYear(), qStart.getMonth() + 3, 1);
  const tiers = Array.isArray(fin.settings?.tier_thresholds) ? fin.settings.tier_thresholds.map(Number) : [0, 70, 100];
  const sim = staffOf(users).filter((u) => u.role === "sales_agent").map((u) => {
    const brought = round2((fin.dealAgents || []).filter((a) => a.agent_id === u.id).reduce((s, a) => { const d = (fin.deals || []).find((x) => x.id === a.deal_id && x.status === "approved"); const at = d && new Date(d.done_at || d.reviewed_at || d.created_at); if (!d || !(at >= qStart && at < qEnd)) return s; const side = a.side === "buyer" ? num(d.commission_buyer) : a.side === "seller" ? num(d.commission_seller) : num(d.commission_total); return s + side * num(a.split_pct) / 100; }, 0));
    const target = num((fin.targets || []).find((t) => t.user_id === u.id)?.quarterly_target);
    const ach = target ? (brought * 100) / target : 0;
    const tier = tiers.reduce((t, th, i) => (ach >= th ? i : t), 0);
    const cur = ((fin.rates || []).find((r) => r.seller_id === u.id && r.beneficiary_id === u.id)?.rates || [0, 0, 0]).map(Number);
    const nr = rates.map((r, i) => (r === "" ? cur[i] : num(r)));
    return { u, brought, target, ach: Math.round(ach), tier, now: round2(brought * (cur[tier] || 0) / 100), next: round2(brought * (nr[tier] || 0) / 100) };
  });
  const Card = ({ title, children, sub }) => <div className="card" style={{ padding: 14, marginBottom: 12 }}><div style={{ fontWeight: 800, color: COLORS.navy }}>{title}</div>{sub && <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>{sub}</div>}{children}</div>;
  const R = { ...tdStyle, textAlign: "right" };
  const approx = n.exactRates ? "≈" : "≈ (estimate)";
  return (
    <div>
      <AiAnalystCard getToken={getToken} />
      <Card title="Alerts" sub="Checked every time you open this page.">
        {alerts.map((a, i) => <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "6px 0", fontSize: 13.5 }}><Badge tone={a.tone}>{a.tone === "active" ? "OK" : "!"}</Badge><span>{a.text}</span></div>)}
      </Card>
      <Card title="Reserved & pending deals — by expected transfer" sub={`Gross = commission still to collect. Net ${approx} = after the sales' share (${Math.round(n.payoutRatio * 100)}% paid out over the last 12 months).`}>
        <div data-pipeline style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8, marginTop: 6 }}>
          {buckets.filter(([b]) => b === "this" || b === "next" || b === "after" || sumP(b) > 0).map(([b, l]) => (
            <div key={b} style={{ background: b === "overdue" ? "#FDECEC" : COLORS.cream, borderRadius: 12, padding: "8px 10px" }}>
              <div style={{ fontSize: 11.5, color: b === "overdue" ? COLORS.danger : COLORS.textMuted, fontWeight: 700 }}>{l}</div>
              <div style={{ fontWeight: 800, color: b === "overdue" ? COLORS.danger : COLORS.navy }}>{egp(sumP(b))}</div>
              <div style={{ fontSize: 11.5, color: COLORS.textMuted }}>net {approx} {egp(sumP(b, "net"))}</div>
            </div>
          ))}
        </div>
        {n.pipeline.length > 0 && (
          <TableWrap><thead><tr><th style={thStyle}>Deal</th><th style={thStyle}>Status</th><th style={thStyle}>Expected transfer</th><th style={thNum}>Gross</th><th style={thNum}>Net {approx}</th></tr></thead><tbody>
            {[...n.pipeline].sort((a, b) => String(a.when || "9999").localeCompare(String(b.when || "9999"))).map((p) => (
              <tr key={p.id} style={p.bucket === "overdue" ? { color: COLORS.danger } : undefined}><td style={tdStyle}>{p.label}</td><td style={tdStyle}>{p.status}</td><td style={{ ...tdStyle, color: p.bucket === "overdue" ? COLORS.danger : undefined, fontWeight: p.bucket === "overdue" ? 800 : undefined }}>{p.when ? formatDate(p.when) : "—"}{p.bucket === "overdue" ? " · overdue" : ""}</td><td style={R}>{egp(p.due)}</td><td style={R}>{egp(p.net)}</td></tr>
            ))}
          </tbody></TableWrap>
        )}
      </Card>
      <Card title="Runway" sub={`Fixed costs ${egpFull(n.fixed)} / month = salaries ${egpFull(n.salaries)} + recurring ${egpFull(n.recurring)}.`}>
        <div style={{ fontSize: 14, marginTop: 4 }}>Cash {egpFull(n.cash)} ÷ fixed costs = <b data-runway style={{ color: n.runway !== null && n.runway < 2 ? COLORS.danger : COLORS.navy }}>{n.runway === null ? "—" : `${n.runway} months`}</b> with no new sales.</div>
      </Card>
      <Card title="Cash flow — next 3 months" sub={`Start ${egpFull(n.cash)} · fixed costs ${egpFull(n.fixed)}/month. Scenario B adds reserved deals (net ${approx}) in the month of their expected transfer; overdue ones in this month.`}>
        <TableWrap><thead><tr><th style={thStyle}>Month</th><th style={thNum}>Out</th><th style={thNum}>A · no sales — end</th><th style={thNum}>B · in from reserved</th><th style={thNum}>B · end</th></tr></thead><tbody>
          {flow.map((p) => <tr key={p.m}><td style={tdStyle}>{monthLabel(p.m)}</td><td style={R}>{egp(p.out)}</td><td style={{ ...R, fontWeight: 800, color: p.endA < 0 ? COLORS.danger : COLORS.navy }}>{egp(p.endA)}</td><td style={R}>{egp(p.inB)}</td><td style={{ ...R, fontWeight: 800, color: p.endB < 0 ? COLORS.danger : COLORS.navy }}>{egp(p.endB)}</td></tr>)}
        </tbody></TableWrap>
      </Card>
      <Card title="Profit share — how much can we give?" sub="Keeps months of fixed costs in the bank and the commissions still owed to the sales first.">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
          <Field label="Months of costs to keep"><input value={safety} onChange={(e) => setSafety(e.target.value)} inputMode="decimal" style={{ ...inputStyle, width: 120 }} /></Field>
          <Field label="% of the rest to share"><input value={sharePct} onChange={(e) => setSharePct(e.target.value)} inputMode="decimal" style={{ ...inputStyle, width: 120 }} /></Field>
        </div>
        <div data-profit-share style={{ fontSize: 13.5, marginTop: 8, lineHeight: 1.7 }}>Cash {egpFull(n.cash)} − reserve {egpFull(reserve)} ({num(safety)} × {egpFull(n.fixed)}) − unpaid sales commissions {egpFull(n.unpaidCommissions)} = <b>{egpFull(distributable)}</b> free. Sharing {num(sharePct)}% → <b>{egpFull(round2(distributable * num(sharePct) / 100))}</b>.{distributable === 0 && <span style={{ color: COLORS.danger }}> Not a good time — cash is below the reserve.</span>}</div>
      </Card>
      <Card title="Hiring — can we add a sales person?" sub={`Average company commission per deal (12 months): ${egpFull(n.avgDeal)} · ${n.dealsPerMonth} deals/month.`}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
          <Field label="Monthly salary"><MoneyInput value={hire.salary} onChange={(v) => setHire({ ...hire, salary: v })} /></Field>
          <Field label="Months to ramp up"><input value={hire.ramp} onChange={(e) => setHire({ ...hire, ramp: e.target.value })} style={{ ...inputStyle, width: 110 }} /></Field>
          <Field label="% of commission the company keeps"><input value={hire.keep} onChange={(e) => setHire({ ...hire, keep: e.target.value })} style={{ ...inputStyle, width: 110 }} /></Field>
        </div>
        <div style={{ fontSize: 13.5, marginTop: 8, lineHeight: 1.7 }}>
          Ramp-up cost before the first deal: <b>{egpFull(round2(num(hire.salary) * num(hire.ramp)))}</b>. After that they cover their salary with <b>{dealsToCover || "—"} deal{dealsToCover === 1 ? "" : "s"}/month</b>.
          {n.cash - num(hire.salary) * num(hire.ramp) < n.fixed * 2 && <span style={{ color: COLORS.danger }}> Careful: after the ramp-up, cash would cover less than 2 months of costs.</span>}
        </div>
      </Card>
      <Card title="Commission what-if" sub={`Last quarter (${qStart.toLocaleDateString("en-GB", { month: "short" })}–${new Date(qEnd - 1).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}). Tiers by target achievement: ${tiers.join(" / ")}%. Leave a box empty to keep today's rate.`}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "6px 0" }}>{[0, 1, 2].map((i) => <Field key={i} label={`New rate tier ${i + 1} (%)`}><input value={rates[i]} onChange={(e) => setRates(rates.map((r, k) => (k === i ? e.target.value : r)))} style={{ ...inputStyle, width: 110 }} /></Field>)}</div>
        <TableWrap><thead><tr><th style={thStyle}>Sales</th><th style={thNum}>Brought</th><th style={thNum}>Target</th><th style={thNum}>Achieved</th><th style={thNum}>Payout now</th><th style={thNum}>Payout new</th></tr></thead><tbody>
          {sim.map((s) => <tr key={s.u.id}><td style={tdStyle}>{s.u.name}</td><td style={R}>{egp(s.brought)}</td><td style={R}>{s.target ? egp(s.target) : "—"}</td><td style={R}>{s.target ? `${s.ach}%` : "—"}</td><td style={R}>{egp(s.now)}</td><td style={{ ...R, fontWeight: 800 }}>{egp(s.next)}</td></tr>)}
          <tr><td style={{ ...tdStyle, fontWeight: 800 }}>Total</td><td style={tdStyle} /><td style={tdStyle} /><td style={tdStyle} /><td style={{ ...R, fontWeight: 800 }}>{egp(round2(sim.reduce((s, x) => s + x.now, 0)))}</td><td style={{ ...R, fontWeight: 800 }}>{egp(round2(sim.reduce((s, x) => s + x.next, 0)))}</td></tr>
        </tbody></TableWrap>
      </Card>
    </div>
  );
}

// ---------- late permission (ask before coming late; approved days are not deducted) ----------
function LatePermissions({ profile, users, getToken }) {
  const [rows, setRows] = useState(null);
  const [form, setForm] = useState({ day: todayCairo(), until: "12:00", reason: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const load = async () => { try { setRows(await db.select("late_permissions", "&order=day.desc&limit=200", await getToken()) || []); } catch (e) { setRows([]); } };
  useEffect(() => { load(); }, []); // eslint-disable-line
  const nm = (id) => users.find((u) => u.id === id)?.name || "—";
  const isStaff = !["admin", "ceo"].includes(profile.role);
  const team = (rows || []).filter((r) => r.user_id !== profile.id);
  const decide = async (r, status) => { setBusy(true); try { await db.update("late_permissions", r.id, { status, decided_by: profile.id, decided_at: new Date().toISOString() }, await getToken()); await load(); } catch (e) { window.alert(e.message); } finally { setBusy(false); } };
  const tone = { pending: "pending", approved: "active", rejected: "hold" };
  return (
    <div className="card" data-late-perm style={{ padding: 14, marginBottom: 12 }}>
      <div style={{ fontWeight: 800, color: COLORS.navy }}>Late permission</div>
      <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Ask before the day. If your manager approves, coming in by that time is not deducted and not counted as late.</div>
      {isStaff && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8 }}>
          <Field label="Day"><input type="date" value={form.day} min={todayCairo()} onChange={(e) => setForm({ ...form, day: e.target.value })} style={inputStyle} /></Field>
          <Field label="I'll be in by"><input type="time" value={form.until} onChange={(e) => setForm({ ...form, until: e.target.value })} style={inputStyle} /></Field>
          <Field label="Reason"><input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} style={inputStyle} placeholder="e.g. doctor, bank" /></Field>
          <div style={{ display: "flex", alignItems: "flex-end" }}><button style={{ ...btnPrimary, width: "100%" }} disabled={busy || !form.day || !form.until} onClick={async () => {
            setErr(""); setBusy(true);
            try { await db.insert("late_permissions", { user_id: profile.id, day: form.day, until_time: form.until, reason: form.reason.trim() || null }, await getToken()); setForm({ ...form, reason: "" }); await load(); }
            catch (e) { setErr(e.message || "Couldn't send"); } finally { setBusy(false); }
          }}>Ask permission</button></div>
        </div>
      )}
      {err && <div style={{ color: COLORS.danger, fontSize: 12.5, marginTop: 6 }}>{err}</div>}
      {team.filter((r) => r.status === "pending").map((r) => (
        <div key={r.id} style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${COLORS.border}`, fontSize: 13 }}>
          <span><b>{nm(r.user_id)}</b> · {formatDate(r.day)} · in by {String(r.until_time).slice(0, 5)}{r.reason ? ` · ${r.reason}` : ""}</span>
          <span style={{ display: "flex", gap: 6 }}><button style={btnPrimary} disabled={busy} onClick={() => decide(r, "approved")}>Approve</button><button style={btnGhost} disabled={busy} onClick={() => decide(r, "rejected")}>Reject</button></span>
        </div>
      ))}
      {(rows || []).filter((r) => r.status !== "pending" || r.user_id === profile.id).slice(0, 8).map((r) => (
        <div key={r.id} style={{ display: "flex", justifyContent: "space-between", gap: 8, padding: "6px 0", fontSize: 12.5, borderBottom: `1px solid ${COLORS.border}` }}>
          <span>{r.user_id !== profile.id && <b>{nm(r.user_id)} · </b>}{formatDate(r.day)} · by {String(r.until_time).slice(0, 5)}</span>
          <span style={{ display: "flex", gap: 6, alignItems: "center" }}><Badge tone={tone[r.status]}>{r.status}</Badge>{r.user_id === profile.id && r.status === "pending" && <button style={{ ...btnGhost, padding: "2px 8px" }} onClick={async () => { await db.remove("late_permissions", r.id, await getToken()); load(); }}>Cancel</button>}</span>
        </div>
      ))}
    </div>
  );
}

// ---------- quarterly appraisal: 60% from the CRM numbers + 40% manager ratings → A … D ----------
const PROMOTION_LADDER = ["Property Consultant", "Junior Sales", "Senior Sales", "Acting As Team Leader", "Team Leader", "Sales Manager"];
const APPRAISAL_RATINGS = [["clients", "Client handling"], ["discipline", "Discipline & attendance"], ["team", "Teamwork"], ["learning", "Learning & product knowledge"]];
const gradeOf = (score) => (score >= 85 ? "A" : score >= 75 ? "B+" : score >= 65 ? "B" : score >= 50 ? "C" : "D");
const quarterOfDate = (d) => `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`;
const quarterRange = (q) => { const [y, n] = q.split("-Q").map(Number); const from = new Date(y, (n - 1) * 3, 1); return [from, new Date(y, n * 3, 1)]; };
const lastQuarters = (k) => [...Array(k)].map((_, i) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 3 * i); return quarterOfDate(d); });

function appraisalAuto({ uid, quarter, fin, activity, attendance, rank }) {
  const [from, to] = quarterRange(quarter);
  const inQ = (iso) => iso && new Date(iso) >= from && new Date(iso) < to;
  const brought = round2((fin.dealAgents || []).filter((a) => a.agent_id === uid).reduce((s, a) => {
    const d = (fin.deals || []).find((x) => x.id === a.deal_id && ["approved", "reserved"].includes(x.status));
    if (!d || !inQ(d.done_at || d.reserved_at || d.reviewed_at || d.created_at)) return s;
    const side = a.side === "buyer" ? num(d.commission_buyer) : a.side === "seller" ? num(d.commission_seller) : num(d.commission_total);
    return s + side * num(a.split_pct) / 100;
  }, 0));
  const target = num((fin.targets || []).find((t) => t.user_id === uid)?.quarterly_target);
  const deals = (fin.deals || []).filter((d) => ["approved", "reserved"].includes(d.status) && inQ(d.done_at || d.reserved_at || d.reviewed_at || d.created_at) && (fin.dealAgents || []).some((a) => a.deal_id === d.id && a.agent_id === uid)).length;
  const meetings = activity.filter((a) => a.changedBy === uid && inQ(a.changedAt) && a.action === "quick_reply" && a.fieldName === "meeting_done").length;
  const calls = num((rank || []).find((r) => r.user_id === uid)?.calls);
  const lates = new Set(attendance.filter((a) => a.userId === uid && inQ(a.checkedInAt) && cairoParts(a.checkedInAt).minutes > LATE_RULES.graceUntil).map((a) => cairoParts(a.checkedInAt).day)).size;
  const ach = target ? (brought * 100) / target : 0;
  const parts = [
    { k: "target", label: `Target ${target ? `${Math.round(ach)}%` : "not set"}`, pts: round2(Math.min(1, ach / 100) * 25), max: 25 },
    { k: "deals", label: `${deals} deal${deals === 1 ? "" : "s"}`, pts: round2(Math.min(1, deals / 3) * 10), max: 10 },
    { k: "meetings", label: `${meetings} meetings done`, pts: round2(Math.min(1, meetings / 12) * 10), max: 10 },
    { k: "calls", label: `${calls} calls`, pts: round2(Math.min(1, calls / 300) * 10), max: 10 },
    { k: "late", label: `${lates} late day${lates === 1 ? "" : "s"}`, pts: round2(Math.max(0, 5 - lates * 0.5)), max: 5 },
  ];
  return { brought, target, ach: Math.round(ach), deals, meetings, calls, lates, parts, score: round2(parts.reduce((s, p) => s + p.pts, 0)) };
}

function AppraisalPage({ profile, users, visibleSalesIds, activity, fin, attendance, getToken }) {
  const [quarter, setQuarter] = useState(() => lastQuarters(1)[0]);
  const [rows, setRows] = useState([]);
  const [promos, setPromos] = useState([]);
  const [rank, setRank] = useState([]);
  const [edit, setEdit] = useState(null);
  const [busy, setBusy] = useState(false);
  const admin = isFinanceAdmin(profile);
  const manager = admin || profile.role !== "sales_agent";
  const people = manager ? staffOf(users).filter((u) => admin || (visibleSalesIds.includes(u.id) && u.id !== profile.id)) : [profile];
  const load = async () => {
    const t = await getToken(); const [from, to] = quarterRange(quarter);
    setRows(await db.select("appraisals", "&order=quarter.desc", t).catch(() => []) || []);
    setPromos(await db.select("promotions", "&order=created_at.desc", t).catch(() => []) || []);
    setRank(await db.rpc("sales_ranking", { p_from: from.toISOString(), p_to: to.toISOString() }, t).catch(() => []) || []);
  };
  useEffect(() => { load(); }, [quarter]); // eslint-disable-line
  const save = async (u, auto, ratings, notes, goals) => {
    setBusy(true);
    try {
      const mgr = round2((APPRAISAL_RATINGS.reduce((s, [k]) => s + num(ratings[k]), 0) / (APPRAISAL_RATINGS.length * 5)) * 40);
      const score = round2(auto.score + mgr);
      await db.upsert("appraisals", { user_id: u.id, quarter, auto: { parts: auto.parts, brought: auto.brought, target: auto.target }, ratings, auto_score: auto.score, manager_score: mgr, score, grade: gradeOf(score), notes: notes || null, goals: goals || null, by_user: profile.id, updated_at: new Date().toISOString() }, "user_id,quarter", await getToken());
      setEdit(null); await load();
    } catch (e) { window.alert(e.message); } finally { setBusy(false); }
  };
  // promotion suggestions: next title on the ladder after ≥ 6 months in the title and the last 2 appraisals B or better
  const suggestion = (u) => {
    const i = PROMOTION_LADDER.indexOf(u.jobTitle || "Property Consultant");
    if (i < 0 || i >= PROMOTION_LADDER.length - 1) return null;
    const mine = rows.filter((r) => r.user_id === u.id).sort((a, b) => (a.quarter < b.quarter ? 1 : -1)).slice(0, 2);
    const months = u.jobTitleSince ? (Date.now() - new Date(u.jobTitleSince).getTime()) / (30.4 * MS_DAY) : 99;
    const goodGrades = mine.length === 2 && mine.every((r) => ["A", "B+", "B"].includes(r.grade));
    const wasRejected = promos.some((p) => p.user_id === u.id && p.status === "rejected" && p.to_title === PROMOTION_LADDER[i + 1] && Date.now() - new Date(p.created_at).getTime() < 90 * MS_DAY);
    if (months < 6 || !goodGrades || wasRejected) return null;
    return { from: u.jobTitle || PROMOTION_LADDER[0], to: PROMOTION_LADDER[i + 1], criteria: { months_in_title: Math.round(months), grades: mine.map((r) => `${r.quarter}: ${r.grade}`) } };
  };
  const decidePromo = async (u, sug, status) => {
    setBusy(true);
    try { await db.insert("promotions", { user_id: u.id, from_title: sug.from, to_title: sug.to, status, criteria: sug.criteria, decided_by: profile.id }, await getToken()); await load(); if (status === "approved") celebrate("promotion", `${u.name} is now ${sug.to} 🎉`); }
    catch (e) { window.alert(e.message); } finally { setBusy(false); }
  };
  const suggestions = admin ? staffOf(users).map((u) => ({ u, sug: suggestion(u) })).filter((x) => x.sug) : [];
  return (
    <div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 10 }}>
        <select value={quarter} onChange={(e) => setQuarter(e.target.value)} style={{ ...inputStyle, width: "auto" }}>{lastQuarters(6).map((q) => <option key={q} value={q}>{q}</option>)}</select>
        <span style={{ fontSize: 12, color: COLORS.textMuted }}>60 points from the CRM (target 25, deals 10, meetings 10, calls 10, punctuality 5) + 40 from the manager · A ≥ 85 · B+ ≥ 75 · B ≥ 65 · C ≥ 50 · D</span>
      </div>
      {suggestions.length > 0 && (
        <div className="card" data-promo-suggest style={{ padding: 14, marginBottom: 12, borderTop: `3px solid ${COLORS.gold}` }}>
          <div style={{ fontWeight: 800, color: COLORS.navy }}>Promotion suggestions</div>
          <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Only a suggestion — nothing changes until you approve.</div>
          {suggestions.map(({ u, sug }) => (
            <div key={u.id} style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${COLORS.border}`, fontSize: 13 }}>
              <span><b>{u.name}</b>: {sug.from} → <b>{sug.to}</b> · {sug.criteria.months_in_title} months in title · {sug.criteria.grades.join(", ")}</span>
              <span style={{ display: "flex", gap: 6 }}><button style={btnPrimary} disabled={busy} onClick={() => decidePromo(u, sug, "approved")}>Approve</button><button style={btnGhost} disabled={busy} onClick={() => decidePromo(u, sug, "rejected")}>Not now</button></span>
            </div>
          ))}
        </div>
      )}
      {people.map((u) => {
        const auto = appraisalAuto({ uid: u.id, quarter, fin, activity, attendance, rank });
        const saved = rows.find((r) => r.user_id === u.id && r.quarter === quarter);
        return (
          <div key={u.id} className="card" data-appraisal style={{ padding: 12, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <div><div style={{ fontWeight: 800, color: COLORS.navy }}>{u.name}</div><div style={{ fontSize: 12, color: COLORS.textMuted }}>{u.jobTitle || ROLE_LABEL[u.role]}</div></div>
              {saved ? <Badge tone={["A", "B+"].includes(saved.grade) ? "active" : saved.grade === "B" ? "neutral" : "hold"}>{saved.grade} · {Math.round(num(saved.score))}/100</Badge> : <Badge tone="pending">CRM {Math.round(auto.score)}/60 · not rated</Badge>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 6, marginTop: 8 }}>
              {auto.parts.map((p) => <div key={p.k} style={{ background: COLORS.cream, borderRadius: 10, padding: "6px 8px" }}><div style={{ fontSize: 11, color: COLORS.textMuted }}>{p.label}</div><div style={{ fontWeight: 800, color: COLORS.navy }}>{p.pts} / {p.max}</div></div>)}
            </div>
            {saved && edit !== u.id && (saved.notes || saved.goals) && <div style={{ fontSize: 13, marginTop: 8, lineHeight: 1.6 }}>{saved.notes && <div><b>Notes:</b> {saved.notes}</div>}{saved.goals && <div><b>Goals next quarter:</b> {saved.goals}</div>}</div>}
            {manager && u.id !== profile.id && (edit === u.id
              ? <AppraisalForm saved={saved} busy={busy} onCancel={() => setEdit(null)} onSave={(r, n, g) => save(u, auto, r, n, g)} />
              : <button style={{ ...btnGhost, marginTop: 8 }} onClick={() => setEdit(u.id)}>{saved ? "Edit appraisal" : "Rate"}</button>)}
          </div>
        );
      })}
    </div>
  );
}
function AppraisalForm({ saved, busy, onSave, onCancel }) {
  const [r, setR] = useState(saved?.ratings || {});
  const [notes, setNotes] = useState(saved?.notes || "");
  const [goals, setGoals] = useState(saved?.goals || "");
  const done = APPRAISAL_RATINGS.every(([k]) => num(r[k]) > 0);
  return (
    <div style={{ marginTop: 8 }}>
      {APPRAISAL_RATINGS.map(([k, l]) => (
        <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, fontSize: 13 }}>
          <span>{l}</span>
          <span>{[1, 2, 3, 4, 5].map((n) => <button key={n} data-rate={`${k}-${n}`} onClick={() => setR({ ...r, [k]: n })} style={{ border: "none", background: "none", fontSize: 22, cursor: "pointer", color: n <= num(r[k]) ? COLORS.gold : COLORS.border }}>★</button>)}</span>
        </div>
      ))}
      <Field label="Notes"><textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical" }} /></Field>
      <Field label="Goals next quarter"><textarea value={goals} onChange={(e) => setGoals(e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical" }} /></Field>
      <div style={{ display: "flex", gap: 6, marginTop: 6 }}><button style={btnPrimary} disabled={!done || busy} onClick={() => onSave(r, notes.trim(), goals.trim())}>Save</button><button style={btnGhost} onClick={onCancel}>Cancel</button></div>
    </div>
  );
}

// Everyone sees the celebration once when a teammate is promoted
function PromotionWatcher({ profile, getToken }) {
  useEffect(() => {
    let off = false;
    const check = async () => {
      try {
        const rows = await db.select("promotions", `&status=eq.approved&created_at=gte.${new Date(Date.now() - 7 * MS_DAY).toISOString()}&order=created_at.asc`, await getToken());
        const key = `origin_promos_seen_${profile.id}`;
        let seen = []; try { seen = JSON.parse(localStorage.getItem(key) || "[]"); } catch (e) { seen = []; }
        const fresh = (rows || []).filter((r) => !seen.includes(r.id) && r.decided_by !== profile.id);
        if (off || !fresh.length) return;
        const p = fresh[fresh.length - 1];
        celebrate("promotion", `${p.user_id === profile.id ? "You are" : "Your teammate is"} now ${p.to_title} 🎉`);
        try { localStorage.setItem(key, JSON.stringify([...seen, ...fresh.map((r) => r.id)].slice(-50))); } catch (e) {}
      } catch (e) { /* not ready yet */ }
    };
    const t = setTimeout(check, 2500);
    return () => { off = true; clearTimeout(t); };
  }, [profile.id]); // eslint-disable-line
  return null;
}

// Clients in "No answer" for 14+ days: the manager is asked if they want to give them to someone else
function NoAnswerReassign({ profile, clients, users, visibleSalesIds, onReassign }) {
  const [pick, setPick] = useState({});
  const [busy, setBusy] = useState(null);
  const [hidden, setHidden] = useState(false);
  const old = clients.filter((c) => c.stage === "not_responding" && visibleSalesIds.includes(c.assignedTo) && new Date(c.stageSince || c.updatedAt || c.createdAt) < new Date(Date.now() - 14 * MS_DAY));
  if (profile.role === "sales_agent" || !old.length || hidden) return null;
  const people = staffOf(users).filter((u) => visibleSalesIds.includes(u.id));
  const nm = (id) => users.find((u) => u.id === id)?.name || "—";
  return (
    <div className="card" data-reassign style={{ padding: 14, marginBottom: 12, borderLeft: `4px solid ${COLORS.gold}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><div style={{ fontWeight: 800, color: COLORS.navy }}>{old.length} client{old.length === 1 ? "" : "s"} in No answer for 14+ days</div><button onClick={() => setHidden(true)} style={{ border: "none", background: "none", color: COLORS.textMuted, cursor: "pointer" }}>Hide</button></div>
      <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>Give them to someone else? If a new sales closes it, the first sales still gets 20% of the sales share.</div>
      {old.slice(0, 8).map((c) => (
        <div key={c.id} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", padding: "6px 0", borderBottom: `1px solid ${COLORS.border}`, fontSize: 13 }}>
          <span style={{ flex: "1 1 160px" }}><b>{c.name}</b> · {nm(c.assignedTo)} · {Math.floor((Date.now() - new Date(c.stageSince || c.updatedAt || c.createdAt)) / MS_DAY)} days</span>
          <select value={pick[c.id] || ""} onChange={(e) => setPick({ ...pick, [c.id]: e.target.value })} style={{ ...inputStyle, width: "auto", padding: "6px 8px" }}>
            <option value="">Give to…</option>
            {people.filter((u) => u.id !== c.assignedTo).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <button style={{ ...btnPrimary, padding: "6px 12px" }} disabled={!pick[c.id] || busy === c.id} onClick={async () => { setBusy(c.id); try { await onReassign(c, pick[c.id]); } finally { setBusy(null); } }}>Move</button>
        </div>
      ))}
    </div>
  );
}

// ---------- Facebook Lead Ads: who gets the leads (in turn) + a test lead ----------
function FacebookLeadsSettings({ ctx }) {
  const { fin, act, users, getToken } = ctx;
  const [list, setList] = useState(() => fin.settings?.lead_assignees || []);
  const [saved, setSaved] = useState(false);
  const [test, setTest] = useState("");
  const { busy, error, run } = useAction();
  const people = staffOf(users);
  const toggle = (id) => { setSaved(false); setList((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id])); };
  return (
    <div style={finCard} data-fb-settings>
      <div style={{ fontWeight: 600, fontSize: 14, color: COLORS.navy, marginBottom: 4 }}>Facebook leads</div>
      <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 8 }}>Leads from Facebook lead forms come into Clients by themselves and go to these people in turn. A number that's already a client goes to Duplicates instead.</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {people.map((u) => <button key={u.id} onClick={() => toggle(u.id)} className="chip" style={{ border: `1px solid ${list.includes(u.id) ? COLORS.navy : COLORS.border}`, background: list.includes(u.id) ? COLORS.navy : "#fff", color: list.includes(u.id) ? "#fff" : COLORS.text, borderRadius: 999, padding: "5px 12px", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>{list.includes(u.id) ? `${list.indexOf(u.id) + 1}. ` : ""}{u.name}</button>)}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
        <button style={btnPrimary} disabled={busy} onClick={() => run(async () => { await act((t) => db.update("finance_settings", 1, { lead_assignees: list, lead_rr_index: 0, updated_at: new Date().toISOString() }, t)); setSaved(true); })}>Save</button>
        <button style={btnGhost} disabled={busy} onClick={() => run(async () => {
          setTest("");
          const t = await getToken();
          const res = await fetch(`${SUPABASE_URL}/functions/v1/fb-leads?test=1`, { method: "POST", headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${t}`, "Content-Type": "application/json" }, body: JSON.stringify({ name: "Test lead (Facebook)", phone: `010${String(Date.now()).slice(-8)}`, campaign: "Test campaign" }) });
          const j = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(j.error || `Test failed (${res.status}) — is the fb-leads function deployed?`);
          setTest(j.status === "added" ? `Test lead added ✓ — given to ${users.find((u) => u.id === j.assigned_to)?.name || "nobody (choose people above)"}` : `Result: ${j.status}`);
        })}>Send test lead</button>
        {saved && <span style={{ fontSize: 12.5, color: COLORS.success }}>Saved ✓</span>}
        {test && <span data-fb-test style={{ fontSize: 12.5, color: COLORS.success }}>{test}</span>}
      </div>
      {error && <div style={{ color: COLORS.danger, fontSize: 12.5, marginTop: 6 }}>{error}</div>}
    </div>
  );
}
