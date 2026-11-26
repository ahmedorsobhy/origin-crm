
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
function computeDeductions({ userId, month, attendance, leaves, decisions, settings }) {
  const today = todayCairo();
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
    const [leaves, decisions] = await Promise.all([
      db.selectAll("leave_requests", `&status=eq.approved&to_date=gte.${month}-01`, t).catch(() => []),
      db.selectAll("deduction_decisions", `&day=gte.${month}-01&day=lte.${month}-31`, t).catch(() => []),
    ]);
    setData({ leaves: leaves || [], decisions: decisions || [], loaded: true });
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
      {!data.loaded ? <div style={{ color: COLORS.textMuted }}>Loading…</div> : people.map((u) => {
        const rows = computeDeductions({ userId: u.id, month, attendance, leaves: data.leaves, decisions: data.decisions, settings: fin.settings });
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

// ---------- planning (admin): snapshot, alerts, cash flow, profit share, hiring, commission what-if ----------
function planningNumbers({ fin, clients, activity, users }) {
  const now = new Date();
  const mk = (d) => monthKeyOf(d);
  const lastMonths = (n) => [...Array(n)].map((_, k) => { const d = new Date(now.getFullYear(), now.getMonth() - k, 15); return mk(d); });
  const txns = fin.txns || [];
  const balances = (fin.accounts || []).filter((a) => !a.archived).map((a) => ({ name: a.name, balance: round2(txns.filter((t) => t.account_id === a.id).reduce((s, t) => s + (t.direction === "in" ? 1 : -1) * num(t.amount), 0)) }));
  const cash = round2(balances.reduce((s, b) => s + b.balance, 0));
  const salaries = round2((fin.salaries || []).filter((s) => num(s.monthly_salary) > 0 && users.some((u) => u.id === s.user_id)).reduce((s, r) => s + num(r.monthly_salary), 0));
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
  const full = byMonth.slice(1, 4); // last 3 complete months
  const avg = (k) => round2(full.reduce((s, x) => s + num(x[k]), 0) / Math.max(1, full.length));
  const pipeline = (fin.deals || []).filter((d) => ["pending", "reserved"].includes(d.status)).map((d) => ({ label: d.unit_label || d.client_label || "Deal", due: round2(num(d.commission_total) - num(d.commission_collected)), status: d.status })).filter((d) => d.due > 0);
  const approved12 = (fin.deals || []).filter((d) => d.status === "approved" && new Date(d.done_at || d.reviewed_at || d.created_at) > new Date(now.getTime() - 365 * MS_DAY));
  const avgDeal = approved12.length ? round2(approved12.reduce((s, d) => s + num(d.commission_total), 0) / approved12.length) : 0;
  return { balances, cash, salaries, recurring, fixed, byMonth, avg, pipeline, avgDeal, dealsPerMonth: round2(approved12.length / 12) };
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
  const [m0, m1] = [n.byMonth[1], n.byMonth[2]];
  const cpl = (m) => (m && m.adSpend > 0 && m.newClients > 0 ? m.adSpend / m.newClients : 0);
  if (cpl(m0) && cpl(m1) && cpl(m0) > cpl(m1) * 1.3) out.push({ tone: "pending", text: `Cost per lead went up ${Math.round((cpl(m0) / cpl(m1) - 1) * 100)}% in ${monthLabel(m0.month)} (${egpFull(Math.round(cpl(m0)))} vs ${egpFull(Math.round(cpl(m1)))}).` });
  if (!out.length) out.push({ tone: "active", text: "Nothing worrying right now." });
  return out;
}

function PlanningPage({ profile, users, fin, clients, activity }) {
  const n = useMemo(() => planningNumbers({ fin, clients, activity, users }), [fin, clients, activity, users]);
  const alerts = planningAlerts({ n, clients, activity, users });
  const [safety, setSafety] = useState("3");
  const [sharePct, setSharePct] = useState("50");
  const [hire, setHire] = useState({ salary: "10000", ramp: "3", keep: "40" });
  const [rates, setRates] = useState(["", "", ""]);
  const monthlyIn = n.avg("commissionIn");
  const monthlyOut = round2(n.avg("salariesPaid") + n.avg("expenses") + n.avg("payouts"));
  const projection = [1, 2, 3].reduce((acc, k) => { const prev = acc.length ? acc[acc.length - 1].end : n.cash; const inflow = round2(monthlyIn + (k === 1 ? n.pipeline.filter((p) => p.status === "reserved").reduce((s, p) => s + p.due, 0) * 0.5 : 0)); acc.push({ k, start: prev, inflow, out: monthlyOut, end: round2(prev + inflow - monthlyOut) }); return acc; }, []);
  const reserve = round2(num(safety) * Math.max(n.fixed, monthlyOut));
  const distributable = Math.max(0, round2(n.cash - reserve));
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
  const download = () => {
    const snap = { company: COMPANY_LEGAL, generated_at: new Date().toISOString(), cash_now: n.cash, accounts: n.balances, fixed_costs_per_month: { salaries: n.salaries, recurring: n.recurring, total: n.fixed },
      months: n.byMonth, pipeline_commission_due: n.pipeline, avg_company_commission_per_deal_12m: n.avgDeal, deals_per_month_12m: n.dealsPerMonth,
      team: staffOf(users).map((u) => ({ name: u.name, role: u.role, active_clients: clients.filter((c) => c.assignedTo === u.id && !TERMINAL_STAGES.includes(c.stage)).length })),
      sales_last_quarter: sim.map((s) => ({ name: s.u.name, brought: s.brought, target: s.target, achievement_pct: s.ach })), alerts: alerts.map((a) => a.text) };
    const blob = new Blob([JSON.stringify(snap, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `origin-snapshot-${todayCairo()}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  const Card = ({ title, children, sub }) => <div className="card" style={{ padding: 14, marginBottom: 12 }}><div style={{ fontWeight: 800, color: COLORS.navy }}>{title}</div>{sub && <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>{sub}</div>}{children}</div>;
  return (
    <div>
      <Card title="Alerts" sub="Checked every time you open this page.">
        {alerts.map((a, i) => <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "6px 0", fontSize: 13.5 }}><Badge tone={a.tone}>{a.tone === "active" ? "OK" : "!"}</Badge><span>{a.text}</span></div>)}
      </Card>
      <Card title="Business snapshot" sub="A file with the company's numbers for the last 6 months — send it in the chat with Claude for a full analysis.">
        <button style={{ ...btnPrimary, marginTop: 6 }} onClick={download}>⬇ Download snapshot</button>
      </Card>
      <Card title="Cash flow — next 3 months" sub={`Now ${egpFull(n.cash)} · avg in ${egpFull(monthlyIn)}/month · avg out ${egpFull(monthlyOut)}/month (last 3 full months). Half of reserved deals' commission counted next month.`}>
        <TableWrap><thead><tr><th style={thStyle}>Month</th><th style={thNum}>Start</th><th style={thNum}>In</th><th style={thNum}>Out</th><th style={thNum}>End</th></tr></thead><tbody>
          {projection.map((p) => <tr key={p.k}><td style={tdStyle}>+{p.k}</td><td style={{ ...tdStyle, textAlign: "right" }}>{egp(p.start)}</td><td style={{ ...tdStyle, textAlign: "right" }}>{egp(p.inflow)}</td><td style={{ ...tdStyle, textAlign: "right" }}>{egp(p.out)}</td><td style={{ ...tdStyle, textAlign: "right", fontWeight: 800, color: p.end < 0 ? COLORS.danger : COLORS.navy }}>{egp(p.end)}</td></tr>)}
        </tbody></TableWrap>
      </Card>
      <Card title="Profit share — how much can we give?" sub="Keeps a safety reserve of monthly costs in the bank first.">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
          <Field label="Months of costs to keep"><input value={safety} onChange={(e) => setSafety(e.target.value)} inputMode="decimal" style={{ ...inputStyle, width: 120 }} /></Field>
          <Field label="% of the rest to share"><input value={sharePct} onChange={(e) => setSharePct(e.target.value)} inputMode="decimal" style={{ ...inputStyle, width: 120 }} /></Field>
        </div>
        <div style={{ fontSize: 13.5, marginTop: 8, lineHeight: 1.7 }}>Cash {egpFull(n.cash)} − reserve {egpFull(reserve)} = <b>{egpFull(distributable)}</b> free. Sharing {num(sharePct)}% → <b>{egpFull(round2(distributable * num(sharePct) / 100))}</b>.{distributable === 0 && <span style={{ color: COLORS.danger }}> Not a good time — cash is below the reserve.</span>}</div>
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
          {sim.map((s) => <tr key={s.u.id}><td style={tdStyle}>{s.u.name}</td><td style={{ ...tdStyle, textAlign: "right" }}>{egp(s.brought)}</td><td style={{ ...tdStyle, textAlign: "right" }}>{s.target ? egp(s.target) : "—"}</td><td style={{ ...tdStyle, textAlign: "right" }}>{s.target ? `${s.ach}%` : "—"}</td><td style={{ ...tdStyle, textAlign: "right" }}>{egp(s.now)}</td><td style={{ ...tdStyle, textAlign: "right", fontWeight: 800 }}>{egp(s.next)}</td></tr>)}
          <tr><td style={{ ...tdStyle, fontWeight: 800 }}>Total</td><td style={tdStyle} /><td style={tdStyle} /><td style={tdStyle} /><td style={{ ...tdStyle, textAlign: "right", fontWeight: 800 }}>{egp(round2(sim.reduce((s, x) => s + x.now, 0)))}</td><td style={{ ...tdStyle, textAlign: "right", fontWeight: 800 }}>{egp(round2(sim.reduce((s, x) => s + x.next, 0)))}</td></tr>
        </tbody></TableWrap>
      </Card>
    </div>
  );
}
