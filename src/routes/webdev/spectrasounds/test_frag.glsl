#version 300 es

precision highp float;

uniform sampler2D u_texture;

in vec2 v_texCoord;
out vec4 outColor;

// based on https://www.shadertoy.com/view/llKSDz

const float WL_LONGEST  = 780.0;
const float WL_SHORTEST = 390.0;
const float WL_RANGE    = WL_LONGEST - WL_SHORTEST;

// https://regex101.com/r/HjGiwU/1
const vec3[] CIE2006_XYZ = vec3[](
    vec3(3.769647E-03, 4.146161E-04, 1.847260E-02),vec3(4.532416E-03, 5.028333E-04, 2.221101E-02),vec3(5.446553E-03, 6.084991E-04, 2.669819E-02),vec3(6.538868E-03, 7.344436E-04, 3.206937E-02),vec3(7.839699E-03, 8.837389E-04, 3.847832E-02),vec3(9.382967E-03, 1.059646E-03, 4.609784E-02),
    vec3(1.120608E-02, 1.265532E-03, 5.511953E-02),vec3(1.334965E-02, 1.504753E-03, 6.575257E-02),vec3(1.585690E-02, 1.780493E-03, 7.822113E-02),vec3(1.877286E-02, 2.095572E-03, 9.276013E-02),vec3(2.214302E-02, 2.452194E-03, 1.096090E-01),vec3(2.601285E-02, 2.852216E-03, 1.290077E-01),
    vec3(3.043036E-02, 3.299115E-03, 1.512047E-01),vec3(3.544325E-02, 3.797466E-03, 1.764441E-01),vec3(4.109640E-02, 4.352768E-03, 2.049517E-01),vec3(4.742986E-02, 4.971717E-03, 2.369246E-01),vec3(5.447394E-02, 5.661014E-03, 2.725123E-01),vec3(6.223612E-02, 6.421615E-03, 3.117820E-01),
    vec3(7.070048E-02, 7.250312E-03, 3.547064E-01),vec3(7.982513E-02, 8.140173E-03, 4.011473E-01),vec3(8.953803E-02, 9.079860E-03, 4.508369E-01),vec3(9.974848E-02, 1.005608E-02, 5.034164E-01),vec3(1.104019E-01, 1.106456E-02, 5.586361E-01),vec3(1.214566E-01, 1.210522E-02, 6.162734E-01),
    vec3(1.328741E-01, 1.318014E-02, 6.760982E-01),vec3(1.446214E-01, 1.429377E-02, 7.378822E-01),vec3(1.566468E-01, 1.545004E-02, 8.013019E-01),vec3(1.687901E-01, 1.664093E-02, 8.655573E-01),vec3(1.808328E-01, 1.785302E-02, 9.295791E-01),vec3(1.925216E-01, 1.907018E-02, 9.921293E-01),
    vec3(2.035729E-01, 2.027369E-02, 1.051821E+00),vec3(2.137531E-01, 2.144805E-02, 1.107509E+00),vec3(2.231348E-01, 2.260041E-02, 1.159527E+00),vec3(2.319245E-01, 2.374789E-02, 1.208869E+00),vec3(2.403892E-01, 2.491247E-02, 1.256834E+00),vec3(2.488523E-01, 2.612106E-02, 1.305008E+00),
    vec3(2.575896E-01, 2.739923E-02, 1.354758E+00),vec3(2.664991E-01, 2.874993E-02, 1.405594E+00),vec3(2.753532E-01, 3.016909E-02, 1.456414E+00),vec3(2.838921E-01, 3.165145E-02, 1.505960E+00),vec3(2.918246E-01, 3.319038E-02, 1.552826E+00),vec3(2.989200E-01, 3.477912E-02, 1.595902E+00),
    vec3(3.052993E-01, 3.641495E-02, 1.635768E+00),vec3(3.112031E-01, 3.809569E-02, 1.673573E+00),vec3(3.169047E-01, 3.981843E-02, 1.710604E+00),vec3(3.227087E-01, 4.157940E-02, 1.748280E+00),vec3(3.288194E-01, 4.337098E-02, 1.787504E+00),vec3(3.349242E-01, 4.517180E-02, 1.826609E+00),
    vec3(3.405452E-01, 4.695420E-02, 1.863108E+00),vec3(3.451688E-01, 4.868718E-02, 1.894332E+00),vec3(3.482554E-01, 5.033657E-02, 1.917479E+00),vec3(3.494153E-01, 5.187611E-02, 1.930529E+00),vec3(3.489075E-01, 5.332218E-02, 1.934819E+00),vec3(3.471746E-01, 5.470603E-02, 1.932650E+00),
    vec3(3.446705E-01, 5.606335E-02, 1.926395E+00),vec3(3.418483E-01, 5.743393E-02, 1.918437E+00),vec3(3.390240E-01, 5.885107E-02, 1.910430E+00),vec3(3.359926E-01, 6.030809E-02, 1.901224E+00),vec3(3.324276E-01, 6.178644E-02, 1.889000E+00),vec3(3.280157E-01, 6.326570E-02, 1.871996E+00),
    vec3(3.224637E-01, 6.472352E-02, 1.848545E+00),vec3(3.156225E-01, 6.614749E-02, 1.817792E+00),vec3(3.078201E-01, 6.757256E-02, 1.781627E+00),vec3(2.994771E-01, 6.904928E-02, 1.742514E+00),vec3(2.909776E-01, 7.063280E-02, 1.702749E+00),vec3(2.826646E-01, 7.238339E-02, 1.664439E+00),
    vec3(2.747962E-01, 7.435960E-02, 1.629207E+00),vec3(2.674312E-01, 7.659383E-02, 1.597360E+00),vec3(2.605847E-01, 7.911436E-02, 1.568896E+00),vec3(2.542749E-01, 8.195345E-02, 1.543823E+00),vec3(2.485254E-01, 8.514816E-02, 1.522157E+00),vec3(2.433039E-01, 8.872657E-02, 1.503611E+00),
    vec3(2.383414E-01, 9.266008E-02, 1.486673E+00),vec3(2.333253E-01, 9.689723E-02, 1.469595E+00),vec3(2.279619E-01, 1.013746E-01, 1.450709E+00),vec3(2.219781E-01, 1.060145E-01, 1.428440E+00),vec3(2.151735E-01, 1.107377E-01, 1.401587E+00),vec3(2.075619E-01, 1.155111E-01, 1.370094E+00),
    vec3(1.992183E-01, 1.203122E-01, 1.334220E+00),vec3(1.902290E-01, 1.251161E-01, 1.294275E+00),vec3(1.806905E-01, 1.298957E-01, 1.250610E+00),vec3(1.707154E-01, 1.346299E-01, 1.203696E+00),vec3(1.604471E-01, 1.393309E-01, 1.154316E+00),vec3(1.500244E-01, 1.440235E-01, 1.103284E+00),
    vec3(1.395705E-01, 1.487372E-01, 1.051347E+00),vec3(1.291920E-01, 1.535066E-01, 9.991789E-01),vec3(1.189859E-01, 1.583644E-01, 9.473958E-01),vec3(1.090615E-01, 1.633199E-01, 8.966222E-01),vec3(9.951424E-02, 1.683761E-01, 8.473981E-01),vec3(9.041850E-02, 1.735365E-01, 8.001576E-01),
    vec3(8.182895E-02, 1.788048E-01, 7.552379E-01),vec3(7.376817E-02, 1.841819E-01, 7.127879E-01),vec3(6.619477E-02, 1.896559E-01, 6.725198E-01),vec3(5.906380E-02, 1.952101E-01, 6.340976E-01),vec3(5.234242E-02, 2.008259E-01, 5.972433E-01),vec3(4.600865E-02, 2.064828E-01, 5.617313E-01),
    vec3(4.006154E-02, 2.121826E-01, 5.274921E-01),vec3(3.454373E-02, 2.180279E-01, 4.948809E-01),vec3(2.949091E-02, 2.241586E-01, 4.642586E-01),vec3(2.492140E-02, 2.307302E-01, 4.358841E-01),vec3(2.083981E-02, 2.379160E-01, 4.099313E-01),vec3(1.723591E-02, 2.458706E-01, 3.864261E-01),
    vec3(1.407924E-02, 2.546023E-01, 3.650566E-01),vec3(1.134516E-02, 2.640760E-01, 3.454812E-01),vec3(9.019658E-03, 2.742490E-01, 3.274095E-01),vec3(7.097731E-03, 2.850680E-01, 3.105939E-01),vec3(5.571145E-03, 2.964837E-01, 2.948102E-01),vec3(4.394566E-03, 3.085010E-01, 2.798194E-01),
    vec3(3.516303E-03, 3.211393E-01, 2.654100E-01),vec3(2.887638E-03, 3.344175E-01, 2.514084E-01),vec3(2.461588E-03, 3.483536E-01, 2.376753E-01),vec3(2.206348E-03, 3.629601E-01, 2.241211E-01),vec3(2.149559E-03, 3.782275E-01, 2.107484E-01),vec3(2.337091E-03, 3.941359E-01, 1.975839E-01),
    vec3(2.818931E-03, 4.106582E-01, 1.846574E-01),vec3(3.649178E-03, 4.277595E-01, 1.720018E-01),vec3(4.891359E-03, 4.453993E-01, 1.596918E-01),vec3(6.629364E-03, 4.635396E-01, 1.479415E-01),vec3(8.942902E-03, 4.821376E-01, 1.369428E-01),vec3(1.190224E-02, 5.011430E-01, 1.268279E-01),
    vec3(1.556989E-02, 5.204972E-01, 1.176796E-01),vec3(1.997668E-02, 5.401387E-01, 1.094970E-01),vec3(2.504698E-02, 5.600208E-01, 1.020943E-01),vec3(3.067530E-02, 5.800972E-01, 9.527993E-02),vec3(3.674999E-02, 6.003172E-01, 8.890075E-02),vec3(4.315171E-02, 6.206256E-01, 8.283548E-02),
    vec3(4.978584E-02, 6.409398E-01, 7.700982E-02),vec3(5.668554E-02, 6.610772E-01, 7.144001E-02),vec3(6.391651E-02, 6.808134E-01, 6.615436E-02),vec3(7.154352E-02, 6.999044E-01, 6.117199E-02),vec3(7.962917E-02, 7.180890E-01, 5.650407E-02),vec3(8.821473E-02, 7.351593E-01, 5.215121E-02),
    vec3(9.726978E-02, 7.511821E-01, 4.809566E-02),vec3(1.067504E-01, 7.663143E-01, 4.431720E-02),vec3(1.166192E-01, 7.807352E-01, 4.079734E-02),vec3(1.268468E-01, 7.946448E-01, 3.751912E-02),vec3(1.374060E-01, 8.082074E-01, 3.446846E-02),vec3(1.482471E-01, 8.213817E-01, 3.163764E-02),
    vec3(1.593076E-01, 8.340701E-01, 2.901901E-02),vec3(1.705181E-01, 8.461711E-01, 2.660364E-02),vec3(1.818026E-01, 8.575799E-01, 2.438164E-02),vec3(1.931090E-01, 8.682408E-01, 2.234097E-02),vec3(2.045085E-01, 8.783061E-01, 2.046415E-02),vec3(2.161166E-01, 8.879907E-01, 1.873456E-02),
    vec3(2.280650E-01, 8.975211E-01, 1.713788E-02),vec3(2.405015E-01, 9.071347E-01, 1.566174E-02),vec3(2.535441E-01, 9.169947E-01, 1.429644E-02),vec3(2.671300E-01, 9.269295E-01, 1.303702E-02),vec3(2.811351E-01, 9.366731E-01, 1.187897E-02),vec3(2.954164E-01, 9.459482E-01, 1.081725E-02),
    vec3(3.098117E-01, 9.544675E-01, 9.846470E-03),vec3(3.241678E-01, 9.619834E-01, 8.960687E-03),vec3(3.384319E-01, 9.684390E-01, 8.152811E-03),vec3(3.525786E-01, 9.738289E-01, 7.416025E-03),vec3(3.665839E-01, 9.781519E-01, 6.744115E-03),vec3(3.804244E-01, 9.814106E-01, 6.131421E-03),
    vec3(3.940988E-01, 9.836669E-01, 5.572778E-03),vec3(4.076972E-01, 9.852081E-01, 5.063463E-03),vec3(4.213484E-01, 9.863813E-01, 4.599169E-03),vec3(4.352003E-01, 9.875357E-01, 4.175971E-03),vec3(4.494206E-01, 9.890228E-01, 3.790291E-03),vec3(4.641616E-01, 9.910811E-01, 3.438952E-03),
    vec3(4.794395E-01, 9.934913E-01, 3.119341E-03),vec3(4.952180E-01, 9.959172E-01, 2.829038E-03),vec3(5.114395E-01, 9.980205E-01, 2.565722E-03),vec3(5.280233E-01, 9.994608E-01, 2.327186E-03),vec3(5.448696E-01, 9.999930E-01, 2.111280E-03),vec3(5.618898E-01, 9.997557E-01, 1.915766E-03),
    vec3(5.790137E-01, 9.989839E-01, 1.738589E-03),vec3(5.961882E-01, 9.979123E-01, 1.577920E-03),vec3(6.133784E-01, 9.967737E-01, 1.432128E-03),vec3(6.305897E-01, 9.957356E-01, 1.299781E-03),vec3(6.479223E-01, 9.947115E-01, 1.179667E-03),vec3(6.654866E-01, 9.935534E-01, 1.070694E-03),
    vec3(6.833782E-01, 9.921156E-01, 9.718623E-04),vec3(7.016774E-01, 9.902549E-01, 8.822531E-04),vec3(7.204110E-01, 9.878596E-01, 8.010231E-04),vec3(7.394495E-01, 9.849324E-01, 7.273884E-04),vec3(7.586285E-01, 9.815036E-01, 6.606347E-04),vec3(7.777885E-01, 9.776035E-01, 6.001146E-04),
    vec3(7.967750E-01, 9.732611E-01, 5.452416E-04),vec3(8.154530E-01, 9.684764E-01, 4.954847E-04),vec3(8.337389E-01, 9.631369E-01, 4.503642E-04),vec3(8.515493E-01, 9.571062E-01, 4.094455E-04),vec3(8.687862E-01, 9.502540E-01, 3.723345E-04),vec3(8.853376E-01, 9.424569E-01, 3.386739E-04),
    vec3(9.011588E-01, 9.336897E-01, 3.081396E-04),vec3(9.165278E-01, 9.242893E-01, 2.804370E-04),vec3(9.318245E-01, 9.146707E-01, 2.552996E-04),vec3(9.474524E-01, 9.052333E-01, 2.324859E-04),vec3(9.638388E-01, 8.963613E-01, 2.117772E-04),vec3(9.812596E-01, 8.883069E-01, 1.929758E-04),
    vec3(9.992953E-01, 8.808462E-01, 1.759024E-04),vec3(1.017343E+00, 8.736445E-01, 1.603947E-04),vec3(1.034790E+00, 8.663755E-01, 1.463059E-04),vec3(1.051011E+00, 8.587203E-01, 1.335031E-04),vec3(1.065522E+00, 8.504295E-01, 1.218660E-04),vec3(1.078421E+00, 8.415047E-01, 1.112857E-04),
    vec3(1.089944E+00, 8.320109E-01, 1.016634E-04),vec3(1.100320E+00, 8.220154E-01, 9.291003E-05),vec3(1.109767E+00, 8.115868E-01, 8.494468E-05),vec3(1.118438E+00, 8.007874E-01, 7.769425E-05),vec3(1.126266E+00, 7.896515E-01, 7.109247E-05),vec3(1.133138E+00, 7.782053E-01, 6.507936E-05),
    vec3(1.138952E+00, 7.664733E-01, 5.960061E-05),vec3(1.143620E+00, 7.544785E-01, 5.460706E-05),vec3(1.147095E+00, 7.422473E-01, 5.005417E-05),vec3(1.149464E+00, 7.298229E-01, 4.590157E-05),vec3(1.150838E+00, 7.172525E-01, 4.211268E-05),vec3(1.151326E+00, 7.045818E-01, 3.865437E-05),
    vec3(1.151033E+00, 6.918553E-01, 3.549661E-05),vec3(1.150002E+00, 6.791009E-01, 3.261220E-05),vec3(1.148061E+00, 6.662846E-01, 2.997643E-05),vec3(1.144998E+00, 6.533595E-01, 2.756693E-05),vec3(1.140622E+00, 6.402807E-01, 2.536339E-05),vec3(1.134757E+00, 6.270066E-01, 2.334738E-05),
    vec3(1.127298E+00, 6.135148E-01, 2.150221E-05),vec3(1.118342E+00, 5.998494E-01, 1.981268E-05),vec3(1.108033E+00, 5.860682E-01, 1.826500E-05),vec3(1.096515E+00, 5.722261E-01, 1.684667E-05),vec3(1.083928E+00, 5.583746E-01, 1.554631E-05),vec3(1.070387E+00, 5.445535E-01, 1.435360E-05),
    vec3(1.055934E+00, 5.307673E-01, 1.325915E-05),vec3(1.040592E+00, 5.170130E-01, 1.225443E-05),vec3(1.024385E+00, 5.032889E-01, 1.133169E-05),vec3(1.007344E+00, 4.895950E-01, 1.048387E-05),vec3(9.895268E-01, 4.759442E-01, 0.000000E+00),vec3(9.711213E-01, 4.623958E-01, 0.000000E+00),
    vec3(9.523257E-01, 4.490154E-01, 0.000000E+00),vec3(9.333248E-01, 4.358622E-01, 0.000000E+00),vec3(9.142877E-01, 4.229897E-01, 0.000000E+00),vec3(8.952798E-01, 4.104152E-01, 0.000000E+00),vec3(8.760157E-01, 3.980356E-01, 0.000000E+00),vec3(8.561607E-01, 3.857300E-01, 0.000000E+00),
    vec3(8.354235E-01, 3.733907E-01, 0.000000E+00),vec3(8.135565E-01, 3.609245E-01, 0.000000E+00),vec3(7.904565E-01, 3.482860E-01, 0.000000E+00),vec3(7.664364E-01, 3.355702E-01, 0.000000E+00),vec3(7.418777E-01, 3.228963E-01, 0.000000E+00),vec3(7.171219E-01, 3.103704E-01, 0.000000E+00),
    vec3(6.924717E-01, 2.980865E-01, 0.000000E+00),vec3(6.681600E-01, 2.861160E-01, 0.000000E+00),vec3(6.442697E-01, 2.744822E-01, 0.000000E+00),vec3(6.208450E-01, 2.631953E-01, 0.000000E+00),vec3(5.979243E-01, 2.522628E-01, 0.000000E+00),vec3(5.755410E-01, 2.416902E-01, 0.000000E+00),
    vec3(5.537296E-01, 2.314809E-01, 0.000000E+00),vec3(5.325412E-01, 2.216378E-01, 0.000000E+00),vec3(5.120218E-01, 2.121622E-01, 0.000000E+00),vec3(4.922070E-01, 2.030542E-01, 0.000000E+00),vec3(4.731224E-01, 1.943124E-01, 0.000000E+00),vec3(4.547417E-01, 1.859227E-01, 0.000000E+00),
    vec3(4.368719E-01, 1.778274E-01, 0.000000E+00),vec3(4.193121E-01, 1.699654E-01, 0.000000E+00),vec3(4.018980E-01, 1.622841E-01, 0.000000E+00),vec3(3.844986E-01, 1.547397E-01, 0.000000E+00),vec3(3.670592E-01, 1.473081E-01, 0.000000E+00),vec3(3.497167E-01, 1.400169E-01, 0.000000E+00),
    vec3(3.326305E-01, 1.329013E-01, 0.000000E+00),vec3(3.159341E-01, 1.259913E-01, 0.000000E+00),vec3(2.997374E-01, 1.193120E-01, 0.000000E+00),vec3(2.841189E-01, 1.128820E-01, 0.000000E+00),vec3(2.691053E-01, 1.067113E-01, 0.000000E+00),vec3(2.547077E-01, 1.008052E-01, 0.000000E+00),
    vec3(2.409319E-01, 9.516653E-02, 0.000000E+00),vec3(2.277792E-01, 8.979594E-02, 0.000000E+00),vec3(2.152431E-01, 8.469044E-02, 0.000000E+00),vec3(2.033010E-01, 7.984009E-02, 0.000000E+00),vec3(1.919276E-01, 7.523372E-02, 0.000000E+00),vec3(1.810987E-01, 7.086061E-02, 0.000000E+00),
    vec3(1.707914E-01, 6.671045E-02, 0.000000E+00),vec3(1.609842E-01, 6.277360E-02, 0.000000E+00),vec3(1.516577E-01, 5.904179E-02, 0.000000E+00),vec3(1.427936E-01, 5.550703E-02, 0.000000E+00),vec3(1.343737E-01, 5.216139E-02, 0.000000E+00),vec3(1.263808E-01, 4.899699E-02, 0.000000E+00),
    vec3(1.187979E-01, 4.600578E-02, 0.000000E+00),vec3(1.116088E-01, 4.317885E-02, 0.000000E+00),vec3(1.047975E-01, 4.050755E-02, 0.000000E+00),vec3(9.834835E-02, 3.798376E-02, 0.000000E+00),vec3(9.224597E-02, 3.559982E-02, 0.000000E+00),vec3(8.647506E-02, 3.334856E-02, 0.000000E+00),
    vec3(8.101986E-02, 3.122332E-02, 0.000000E+00),vec3(7.586514E-02, 2.921780E-02, 0.000000E+00),vec3(7.099633E-02, 2.732601E-02, 0.000000E+00),vec3(6.639960E-02, 2.554223E-02, 0.000000E+00),vec3(6.206225E-02, 2.386121E-02, 0.000000E+00),vec3(5.797409E-02, 2.227859E-02, 0.000000E+00),
    vec3(5.412533E-02, 2.079020E-02, 0.000000E+00),vec3(5.050600E-02, 1.939185E-02, 0.000000E+00),vec3(4.710606E-02, 1.807939E-02, 0.000000E+00),vec3(4.391411E-02, 1.684817E-02, 0.000000E+00),vec3(4.091411E-02, 1.569188E-02, 0.000000E+00),vec3(3.809067E-02, 1.460446E-02, 0.000000E+00),
    vec3(3.543034E-02, 1.358062E-02, 0.000000E+00),vec3(3.292138E-02, 1.261573E-02, 0.000000E+00),vec3(3.055672E-02, 1.170696E-02, 0.000000E+00),vec3(2.834146E-02, 1.085608E-02, 0.000000E+00),vec3(2.628033E-02, 1.006476E-02, 0.000000E+00),vec3(2.437465E-02, 9.333376E-03, 0.000000E+00),
    vec3(2.262306E-02, 8.661284E-03, 0.000000E+00),vec3(2.101935E-02, 8.046048E-03, 0.000000E+00),vec3(1.954647E-02, 7.481130E-03, 0.000000E+00),vec3(1.818727E-02, 6.959987E-03, 0.000000E+00),vec3(1.692727E-02, 6.477070E-03, 0.000000E+00),vec3(1.575417E-02, 6.027677E-03, 0.000000E+00),
    vec3(1.465854E-02, 5.608169E-03, 0.000000E+00),vec3(1.363571E-02, 5.216691E-03, 0.000000E+00),vec3(1.268205E-02, 4.851785E-03, 0.000000E+00),vec3(1.179394E-02, 4.512008E-03, 0.000000E+00),vec3(1.096778E-02, 4.195941E-03, 0.000000E+00),vec3(1.019964E-02, 3.902057E-03, 0.000000E+00),
    vec3(9.484317E-03, 3.628371E-03, 0.000000E+00),vec3(8.816851E-03, 3.373005E-03, 0.000000E+00),vec3(8.192921E-03, 3.134315E-03, 0.000000E+00),vec3(7.608750E-03, 2.910864E-03, 0.000000E+00),vec3(7.061391E-03, 2.701528E-03, 0.000000E+00),vec3(6.549509E-03, 2.505796E-03, 0.000000E+00),
    vec3(6.071970E-03, 2.323231E-03, 0.000000E+00),vec3(5.627476E-03, 2.153333E-03, 0.000000E+00),vec3(5.214608E-03, 1.995557E-03, 0.000000E+00),vec3(4.831848E-03, 1.849316E-03, 0.000000E+00),vec3(4.477579E-03, 1.713976E-03, 0.000000E+00),vec3(4.150166E-03, 1.588899E-03, 0.000000E+00),
    vec3(3.847988E-03, 1.473453E-03, 0.000000E+00),vec3(3.569452E-03, 1.367022E-03, 0.000000E+00),vec3(3.312857E-03, 1.268954E-03, 0.000000E+00),vec3(3.076022E-03, 1.178421E-03, 0.000000E+00),vec3(2.856894E-03, 1.094644E-03, 0.000000E+00),vec3(2.653681E-03, 1.016943E-03, 0.000000E+00),
    vec3(2.464821E-03, 9.447269E-04, 0.000000E+00),vec3(2.289060E-03, 8.775171E-04, 0.000000E+00),vec3(2.125694E-03, 8.150438E-04, 0.000000E+00),vec3(1.974121E-03, 7.570755E-04, 0.000000E+00),vec3(1.833723E-03, 7.033755E-04, 0.000000E+00),vec3(1.703876E-03, 6.537050E-04, 0.000000E+00),
    vec3(1.583904E-03, 6.078048E-04, 0.000000E+00),vec3(1.472939E-03, 5.653435E-04, 0.000000E+00),vec3(1.370151E-03, 5.260046E-04, 0.000000E+00),vec3(1.274803E-03, 4.895061E-04, 0.000000E+00),vec3(1.186238E-03, 4.555970E-04, 0.000000E+00),vec3(1.103871E-03, 4.240548E-04, 0.000000E+00),
    vec3(1.027194E-03, 3.946860E-04, 0.000000E+00),vec3(9.557493E-04, 3.673178E-04, 0.000000E+00),vec3(8.891262E-04, 3.417941E-04, 0.000000E+00),vec3(8.269535E-04, 3.179738E-04, 0.000000E+00),vec3(7.689351E-04, 2.957441E-04, 0.000000E+00),vec3(7.149425E-04, 2.750558E-04, 0.000000E+00),
    vec3(6.648590E-04, 2.558640E-04, 0.000000E+00),vec3(6.185421E-04, 2.381142E-04, 0.000000E+00),vec3(5.758303E-04, 2.217445E-04, 0.000000E+00),vec3(5.365046E-04, 2.066711E-04, 0.000000E+00),vec3(5.001842E-04, 1.927474E-04, 0.000000E+00),vec3(4.665005E-04, 1.798315E-04, 0.000000E+00),
    vec3(4.351386E-04, 1.678023E-04, 0.000000E+00),vec3(4.058303E-04, 1.565566E-04, 0.000000E+00),vec3(3.783733E-04, 1.460168E-04, 0.000000E+00),vec3(3.526892E-04, 1.361535E-04, 0.000000E+00),vec3(3.287199E-04, 1.269451E-04, 0.000000E+00),vec3(3.063998E-04, 1.183671E-04, 0.000000E+00),
    vec3(2.856577E-04, 1.103928E-04, 0.000000E+00),vec3(2.664108E-04, 1.029908E-04, 0.000000E+00),vec3(2.485462E-04, 9.611836E-05, 0.000000E+00),vec3(2.319529E-04, 8.973323E-05, 0.000000E+00),vec3(2.165300E-04, 8.379694E-05, 0.000000E+00),vec3(2.021853E-04, 7.827442E-05, 0.000000E+00),
    vec3(1.888338E-04, 7.313312E-05, 0.000000E+00),vec3(1.763935E-04, 6.834142E-05, 0.000000E+00),vec3(1.647895E-04, 6.387035E-05, 0.000000E+00),vec3(1.539542E-04, 5.969389E-05, 0.000000E+00),vec3(1.438270E-04, 5.578862E-05, 0.000000E+00),vec3(1.343572E-04, 5.213509E-05, 0.000000E+00),
    vec3(1.255141E-04, 4.872179E-05, 0.000000E+00),vec3(1.172706E-04, 4.553845E-05, 0.000000E+00),vec3(1.095983E-04, 4.257443E-05, 0.000000E+00),vec3(1.024685E-04, 3.981884E-05, 0.000000E+00),vec3(9.584715E-05, 3.725877E-05, 0.000000E+00),vec3(8.968316E-05, 3.487467E-05, 0.000000E+00),
    vec3(8.392734E-05, 3.264765E-05, 0.000000E+00),vec3(7.853708E-05, 3.056140E-05, 0.000000E+00),vec3(7.347551E-05, 2.860175E-05, 0.000000E+00),vec3(6.871576E-05, 2.675841E-05, 0.000000E+00),vec3(6.425257E-05, 2.502943E-05, 0.000000E+00),vec3(6.008292E-05, 2.341373E-05, 0.000000E+00),
    vec3(5.620098E-05, 2.190914E-05, 0.000000E+00),vec3(5.259870E-05, 2.051259E-05, 0.000000E+00),vec3(4.926279E-05, 1.921902E-05, 0.000000E+00),vec3(4.616623E-05, 1.801796E-05, 0.000000E+00),vec3(4.328212E-05, 1.689899E-05, 0.000000E+00),vec3(4.058715E-05, 1.585309E-05, 0.000000E+00),
    vec3(3.806114E-05, 1.487243E-05, 0.000000E+00),vec3(3.568818E-05, 1.395085E-05, 0.000000E+00),vec3(3.346023E-05, 1.308528E-05, 0.000000E+00),vec3(3.137090E-05, 1.227327E-05, 0.000000E+00),vec3(2.941371E-05, 1.151233E-05, 0.000000E+00),vec3(2.758222E-05, 1.080001E-05, 0.000000E+00),
    vec3(2.586951E-05, 1.013364E-05, 0.000000E+00),vec3(2.426701E-05, 9.509919E-06, 0.000000E+00),vec3(2.276639E-05, 8.925630E-06, 0.000000E+00),vec3(2.136009E-05, 8.377852E-06, 0.000000E+00),vec3(2.004122E-05, 7.863920E-06, 0.000000E+00),vec3(1.880380E-05, 7.381539E-06, 0.000000E+00),
    vec3(1.764358E-05, 6.929096E-06, 0.000000E+00),vec3(1.655671E-05, 6.505136E-06, 0.000000E+00),vec3(1.553939E-05, 6.108221E-06, 0.000000E+00),vec3(1.458792E-05, 5.736935E-06, 0.000000E+00),vec3(1.369853E-05, 5.389831E-06, 0.000000E+00),vec3(1.286705E-05, 5.065269E-06, 0.000000E+00),
    vec3(1.208947E-05, 4.761667E-06, 0.000000E+00),vec3(1.136207E-05, 4.477561E-06, 0.000000E+00),vec3(1.068141E-05, 4.211597E-06, 0.000000E+00),vec3(1.004411E-05, 3.962457E-06, 0.000000E+00),vec3(9.446399E-06, 3.728674E-06, 0.000000E+00),vec3(8.884754E-06, 3.508881E-06, 0.000000E+00),
    vec3(8.356050E-06, 3.301868E-06, 0.000000E+00),vec3(7.857521E-06, 3.106561E-06, 0.000000E+00),vec3(7.386996E-06, 2.922119E-06, 0.000000E+00),vec3(6.943576E-06, 2.748208E-06, 0.000000E+00),vec3(6.526548E-06, 2.584560E-06, 0.000000E+00),vec3(6.135087E-06, 2.430867E-06, 0.000000E+00),
    vec3(5.768284E-06, 2.286786E-06, 0.000000E+00),vec3(5.425069E-06, 2.151905E-06, 0.000000E+00),vec3(5.103974E-06, 2.025656E-06, 0.000000E+00),vec3(4.803525E-06, 1.907464E-06, 0.000000E+00),vec3(4.522350E-06, 1.796794E-06, 0.000000E+00),vec3(4.259166E-06, 1.693147E-06, 0.000000E+00),
    vec3(4.012715E-06, 1.596032E-06, 0.000000E+00),vec3(3.781597E-06, 1.504903E-06, 0.000000E+00),vec3(3.564496E-06, 1.419245E-06, 0.000000E+00),vec3(3.360236E-06, 1.338600E-06, 0.000000E+00),vec3(3.167765E-06, 1.262556E-06, 0.000000E+00),vec3(2.986206E-06, 1.190771E-06, 0.000000E+00),
    vec3(2.814999E-06, 1.123031E-06, 0.000000E+00),vec3(2.653663E-06, 1.059151E-06, 0.000000E+00),vec3(2.501725E-06, 9.989507E-07, 0.000000E+00),vec3(2.358723E-06, 9.422514E-07, 0.000000E+00),vec3(2.224206E-06, 8.888804E-07, 0.000000E+00),vec3(2.097737E-06, 8.386690E-07, 0.000000E+00),
    vec3(1.978894E-06, 7.914539E-07, 0.000000E+00),vec3(1.867268E-06, 7.470770E-07, 0.000000E+00),vec3(1.762465E-06, 7.053860E-07, 0.000000E+00)
);

vec3 wavelengthToXYZ(float wl){
    float ind = wl - WL_SHORTEST;
    if( ind < 0.0 || ind > WL_RANGE ){ // bad arguments
        return vec3(0.0, 0.0, 0.0);
    }
    
    int   low  = int( floor(ind) );
    int   high = int( ceil(ind)  );
    float frac = fract(ind);
    
    return CIE2006_XYZ[low] * (1.0 - frac) + CIE2006_XYZ[high] * (frac);
}
    
vec3 XYZtoRGB(vec3 XYZ)
{
	return XYZ * mat3( 3.240479, -1.537150, -0.498535,
	                  -0.969256 , 1.875991,  0.041556,
	                   0.055648, -0.204043,  1.057311 );
}

float cross2(vec2 a, vec2 b) { return a.x*b.y - a.y*b.x; } 

vec2 intersectSegment(vec2 p0, vec2 p1, vec2 p2, vec2 p3)
{
    vec2 s1 = p1-p0, s2 = p3-p2;

    float d = cross2(s1,s2),
          s = cross2(s1, p0-p2) / d,
          t = cross2(s2, p0-p2) / d;

    return s >= 0. && s <= 1. && t >= 0. && t <= 1.
         ? p0 + t*s1    // Collision detected
         : p0;
}

vec3 XYZtoUniformRGBGamut(vec3 col, float desat)
{
    vec2 xy = col.xy / (col.x + col.y + col.z);
    
    vec2 red   = vec2(0.64,   0.33  ),
         green = vec2(0.3,    0.6   ),
         blue  = vec2(0.15,   0.06  ),
         white = vec2(0.3127, 0.3290);
    
    xy = mix(xy, white, desat); // make gamut clip less obvious by desaturating
    
    xy = intersectSegment(xy, white, red,   green);
    xy = intersectSegment(xy, white, green, blue );
    xy = intersectSegment(xy, white, blue,  red  );
    
    vec3 xyz = col.y * vec3( xy, 1. - xy.x - xy.y ) / xy.y;
    float len = max( length(xyz), 0.41542 ); // https://www.desmos.com/calculator/ffyenyxuye
    
    return xyz / len;
}

const float FQ_MAX = 1.0 / WL_SHORTEST;
const float FQ_MIN = 1.0 / WL_LONGEST;
const float FQ_RANGE = FQ_MAX - FQ_MIN;

void main()
{
    vec2 uv = v_texCoord;
    
    float fq = FQ_MIN + uv.x * FQ_RANGE;
    float wl = 1.0 / fq;
    
    // wl = uv.x * WL_RANGE + WL_SHORTEST;
    
    vec3 color2 = XYZtoRGB( XYZtoUniformRGBGamut( wavelengthToXYZ( wl ), 0.15 ) );

    vec3 color3 = pow(max(vec3(0),color2), vec3(1./2.2)); // with gamma
    color3 = color3 * pow(uv.y * 1., 2.2/1.);
	outColor = vec4(color3,1.);
}
