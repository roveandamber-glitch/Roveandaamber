"use client";
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Lock, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  Gift, 
  CreditCard, 
  ArrowRight,
  AlertCircle,
  Tag,
  Coins,
  Wallet,
  Sparkles,
  Landmark,
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  Navigation,
  Compass,
  FileText,
  Loader2,
  Home
} from 'lucide-react';
import { message, Form, Input, Spin } from 'antd';
import cartService from '@/services/cartService';
import paymentService from '@/services/paymentService';
import { getImageUrl } from '@/utils/imageHelper';
import { AuthGateModal } from '@/components/common';
import authService from '@/services/authService';


// Official Razorpay Vector Brand Logo Component
const RazorpayLogo = ({ className = "h-4.5 w-auto" }) => (
  <svg
    viewBox="0 0 1896 401"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Razorpay"
  >
    <path d="M451.9209,151.4937 C448.9309,162.6497 443.1359,170.8377 434.5349,176.0657 C425.9239,181.2927 413.8469,183.9117 398.2689,183.9117 L348.7769,183.9117 L366.1509,119.0807 L415.6429,119.0807 C431.2089,119.0807 441.8959,121.6947 447.7019,126.9217 C453.4969,132.1547 454.9109,140.3437 451.9209,151.4937 M503.1739,150.0967 C509.4679,126.6377 506.8589,108.6267 495.3509,96.0797 C483.8409,83.5327 463.6739,77.2627 434.8709,77.2627 L324.3909,77.2627 L257.8969,325.4027 L311.5719,325.4027 L338.3809,225.3777 L373.5809,225.3777 C381.4739,225.3777 387.6869,226.6577 392.2309,229.2137 C396.7849,231.7747 399.4509,236.3067 400.2739,242.8037 L409.8479,325.4027 L467.3589,325.4027 L458.0289,248.3847 C456.1279,231.1897 448.2589,221.0827 434.4309,218.0637 C452.0599,212.9577 466.8259,204.4677 478.7179,192.6167 C490.5989,180.7717 498.7579,166.6017 503.1739,150.0967" fill="#072654" />
    <path d="M633.625,236.533 C629.14,253.258 622.231,266.042 612.901,274.868 C603.56,283.7 592.386,288.111 579.382,288.111 C566.122,288.111 557.128,283.758 552.387,275.042 C547.623,266.332 547.461,253.733 551.889,237.228 C556.305,220.735 563.352,207.841 573.053,198.539 C582.742,189.255 594.09,184.602 607.105,184.602 C620.11,184.602 628.919,189.082 633.485,198.024 C638.053,206.966 638.11,219.802 633.625,236.533 L633.625,236.533 Z M657.153,148.706 L650.431,173.8 C647.521,164.736 641.9,157.538 633.578,152.195 C625.245,146.852 614.918,144.174 602.608,144.174 C587.506,144.174 572.983,148.069 559.052,155.852 C545.12,163.64 532.938,174.617 522.519,188.786 C512.099,202.961 504.461,219.107 499.604,237.228 C494.748,255.356 493.774,271.328 496.695,285.149 C499.616,298.977 505.944,309.605 515.691,317.04 C525.428,324.481 537.969,328.19 553.303,328.19 C565.612,328.19 577.342,325.635 588.469,320.523 C599.595,315.418 609.041,308.325 616.818,299.266 L609.807,325.403 L661.731,325.403 L709.079,148.706 L657.153,148.706 Z" fill="#072654" />
    <polygon fill="#072654" points="895.79 148.7061 744.882 148.7061 734.334 188.0911 822.155 188.0911 706.042 288.4581 696.132 325.4031 851.92 325.4031 862.478 286.0241 768.388 286.0241 886.263 184.2541" />
    <path d="M1028.6514,236.1853 C1023.9804,253.6053 1017.0604,266.6273 1007.9044,275.2223 C998.7484,283.8163 987.6674,288.1103 974.6634,288.1103 C947.4714,288.1103 938.5234,270.8113 947.7964,236.1853 C952.4094,218.9903 959.3634,206.0383 968.6594,197.3283 C977.9654,188.6123 989.2324,184.2543 1002.4804,184.2543 C1015.4844,184.2543 1024.2584,188.6123 1028.7794,197.3283 C1033.2984,206.0383 1033.2644,218.9903 1028.6514,236.1853 M1059.0304,155.3243 C1047.0804,147.8943 1031.8154,144.1743 1013.2244,144.1743 C994.4014,144.1743 976.9694,147.8943 960.9174,155.3243 C944.8644,162.7653 931.1984,173.4523 919.9214,187.3893 C908.6314,201.3323 900.4954,217.5943 895.5114,236.1853 C890.5274,254.7763 889.9484,271.0323 893.7734,284.9753 C897.5864,298.9183 905.5144,309.6053 917.5914,317.0403 C929.6574,324.4813 945.0954,328.1903 963.9194,328.1903 C982.5094,328.1903 999.7674,324.4813 1015.7054,317.0403 C1031.6184,309.6053 1045.2374,298.9736 1056.5264,284.9753 C1067.8034,271.0323 1075.9404,254.7763 1080.9244,236.1853 C1085.9084,217.5943 1086.4884,201.3323 1082.6744,187.3893 C1078.8494,173.4523 1070.9674,162.7653 1059.0304,155.3243" fill="#072654" />
    <path d="M1602.1367,236.533 C1597.6517,253.258 1590.7427,266.042 1581.4127,274.868 C1572.0817,283.7 1560.8857,288.111 1547.8817,288.111 C1534.6457,288.111 1525.6397,283.758 1520.8987,275.042 C1516.1347,266.332 1515.9727,253.733 1520.4007,237.228 C1524.8167,220.735 1531.8637,207.841 1541.5647,198.539 C1551.2537,189.255 1562.6017,184.602 1575.6167,184.602 C1588.6217,184.602 1597.4307,189.082 1601.9967,198.024 C1606.5647,206.966 1606.6217,219.802 1602.1367,236.533 L1602.1367,236.533 Z M1625.6647,148.706 L1618.9427,173.8 C1616.0327,164.736 1610.4117,157.538 1602.0897,152.195 C1593.7567,146.852 1583.4297,144.174 1571.1197,144.174 C1556.0177,144.174 1541.4947,148.069 1527.5637,155.852 C1513.6317,163.64 1501.4497,174.617 1491.0307,188.786 C1480.6107,202.961 1472.9717,219.107 1468.1157,237.228 C1463.2597,255.356 1462.2967,271.328 1465.2067,285.149 C1468.1267,298.977 1474.4447,309.605 1484.2027,317.04 C1493.9397,324.481 1506.4807,328.19 1521.8147,328.19 C1534.1227,328.19 1545.8537,325.635 1556.9797,320.523 C1568.1067,315.418 1577.5527,308.325 1585.3297,299.266 L1578.3187,325.403 L1630.2427,325.403 L1677.5907,148.706 L1625.6647,148.706 Z" fill="#072654" />
    <path d="M1244.165,196.1055 L1257.401,148.0105 C1252.904,145.6865 1246.946,144.5225 1239.517,144.5225 C1227.66,144.5225 1216.243,147.4835 1205.244,153.4115 C1195.798,158.4975 1187.754,165.6365 1180.962,174.5815 L1187.847,148.6815 L1172.813,148.7065 L1135.938,148.7065 L1088.227,325.4025 L1140.87,325.4025 L1165.616,233.0505 C1169.221,219.5765 1175.688,209.0635 1185.042,201.5125 C1194.372,193.9615 1206.02,190.1825 1219.964,190.1825 C1228.563,190.1825 1236.619,192.1585 1244.165,196.1055" fill="#072654" />
    <path d="M1390.6973,237.2256 C1386.2693,253.7306 1379.4083,266.3296 1370.1123,275.0396 C1360.7943,283.7556 1349.6433,288.1076 1336.6393,288.1076 C1323.6233,288.1076 1314.7573,283.6976 1310.0393,274.8656 C1305.3103,266.0396 1305.1943,253.2606 1309.6793,236.5296 C1314.1653,219.7996 1321.1423,206.9626 1330.6243,198.0206 C1340.1043,189.0786 1351.3593,184.5986 1364.3753,184.5986 C1377.1473,184.5986 1385.8293,189.2526 1390.4303,198.5426 C1395.0203,207.8376 1395.1133,220.7376 1390.6973,237.2256 M1427.4853,155.8486 C1417.7153,148.0656 1405.2783,144.1776 1390.1873,144.1776 C1376.9393,144.1776 1364.3293,147.1966 1352.3903,153.2356 C1340.4183,159.2856 1330.7173,167.5206 1323.2753,177.9806 L1323.4433,176.8216 L1332.2873,148.6786 L1322.1103,148.6786 L1322.1103,148.7036 L1280.9003,148.7036 L1267.8153,197.5656 C1267.6643,198.1336 1267.5373,198.6636 1267.3853,199.2376 L1213.4093,400.6806 L1266.0423,400.6806 L1293.2213,299.2696 C1295.8863,308.3216 1301.4273,315.4146 1309.8193,320.5206 C1318.2103,325.6316 1328.5603,328.1876 1340.8813,328.1876 C1356.2163,328.1876 1370.7963,324.4786 1384.6463,317.0376 C1398.4863,309.6076 1410.5163,298.9736 1420.7173,285.1466 C1430.9273,271.3306 1438.4623,255.3526 1443.3183,237.2256 C1448.1753,219.1036 1449.1823,202.9586 1446.3663,188.7836 C1443.5503,174.6136 1437.2443,163.6376 1427.4853,155.8486" fill="#072654" />
    <path d="M1895.5381,148.7554 L1895.5721,148.7064 L1863.6921,148.7064 C1862.6731,148.7064 1861.7741,148.7354 1860.8421,148.7554 L1844.2961,148.7554 L1835.8351,160.5434 C1835.1571,161.4314 1834.4791,162.3254 1833.7491,163.3624 L1832.8271,164.7274 L1765.5851,258.3754 L1751.6421,148.7064 L1696.5641,148.7064 L1724.4561,315.3544 L1662.8591,400.6834 L1664.6151,400.6834 L1696.0651,400.6834 L1717.7341,400.6834 L1732.6621,379.5374 C1733.1021,378.9074 1733.4791,378.3914 1733.9491,377.7254 L1751.3691,353.0284 L1751.8681,352.3214 L1829.8131,241.8274 L1895.4851,148.8284 L1895.5721,148.7554 L1895.5381,148.7554 Z" fill="#072654" />
    <polygon fill="#3395FF" points="122.6338 105.6902 106.8778 163.6732 197.0338 105.3642 138.0748 325.3482 197.9478 325.4032 285.0458 0.4822" />
    <path d="M25.5947,232.9246 L0.8077,325.4026 L123.5337,325.4026 C123.5337,325.4026 173.7317,137.3196 173.7457,137.2656 C173.6987,137.2956 25.5947,232.9246 25.5947,232.9246" fill="#072654" />
  </svg>
);

// Dynamically load official Razorpay Checkout SDK
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  
  const [cartItems, setCartItems] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(true);
  const [giftOptions, setGiftOptions] = useState(null);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [useGiftAddress, setUseGiftAddress] = useState(false);
  
  const [paymentMethod] = useState('Razorpay');
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [orderConfirmed, setOrderConfirmed] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [rewardPointsUsed, setRewardPointsUsed] = useState(0);
  const [rewardDiscountAmount, setRewardDiscountAmount] = useState(0);
  const [availableRewardPoints, setAvailableRewardPoints] = useState(0);
  const [rewardRate, setRewardRate] = useState(100);
  const [pointsPerHundred, setPointsPerHundred] = useState(10);
  const [rewardLoading, setRewardLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [savedProfileAddress, setSavedProfileAddress] = useState(null);
  const [saveAddressForFuture, setSaveAddressForFuture] = useState(true);

  const handleFillSavedAddress = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (savedProfileAddress) {
      form.setFieldsValue({
        customerName: savedProfileAddress.customerName || '',
        email: savedProfileAddress.email || '',
        phone: savedProfileAddress.phone || '',
        address: savedProfileAddress.address || '',
        city: savedProfileAddress.city || '',
        state: savedProfileAddress.state || '',
        pincode: savedProfileAddress.pincode || '',
        landmark: savedProfileAddress.landmark || ''
      });
      message.success('Saved address filled. You can edit any field below.');
    }
  };

  const loadCartState = async () => {
    try {
      // Eagerly check in-memory cart to prevent initial flash if already cached
      const immediate = cartService.getCart();
      if (immediate && immediate.length > 0) {
        setCartItems(immediate);
        setIsCheckoutLoading(false);
      }

      await cartService.fetchCart();
      const items = cartService.getCart();
      setCartItems(items);
      const summary = cartService.getCartSummary();
      if (summary && summary.coupon && summary.coupon.code) {
        setAppliedCoupon(summary.coupon);
        setDiscountAmount(Number(summary.discountAmount) || Number(summary.coupon.discountAmount) || 0);
      } else {
        setAppliedCoupon(null);
        setDiscountAmount(0);
      }

      if (summary) {
        setRewardPointsUsed(Number(summary.rewardPointsUsed) || 0);
        setRewardDiscountAmount(Number(summary.rewardDiscountAmount) || 0);
        if (summary.availableRewardPoints !== undefined) {
          setAvailableRewardPoints(Number(summary.availableRewardPoints) || 0);
        }
        if (summary.rewardRate) {
          setRewardRate(Number(summary.rewardRate) || 100);
        }
        if (summary.pointsPerHundred) {
          setPointsPerHundred(Number(summary.pointsPerHundred) || 10);
        }
      } else {
        const user = authService.getUser();
        if (user && user.rewardPoints !== undefined) {
          setAvailableRewardPoints(Number(user.rewardPoints) || 0);
        }
      }
    } catch (e) {
      console.warn('Error loading checkout cart summary:', e);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  useEffect(() => {
    setIsClient(true);
    document.title = 'Secure Boutique Checkout | ROVE & AMBER';

    // Verify authenticated customer account strictly
    if (!authService.isAuthenticated()) {
      setIsCheckingAuth(true);
      setShowAuthModal(true);
      setIsCheckoutLoading(false);
      return;
    }

    setIsCheckingAuth(false);
    loadRazorpayScript().catch(() => {});

    loadCartState();

    // Read saved gift options
    try {
      const storedGifts = localStorage.getItem('rove_amber_gift_options');
      if (storedGifts) {
        const parsed = JSON.parse(storedGifts);
        if (parsed && (parsed.recipientName || parsed.messageText || parsed.packagingName)) {
          setGiftOptions(parsed);
        }
      }
    } catch (e) {
      console.warn('Error reading gift options', e);
    }

    // Prefill form from saved address or user account if logged in
    try {
      let saved = null;
      const cached = localStorage.getItem('rove_amber_saved_address');
      if (cached) {
        try { saved = JSON.parse(cached); } catch (e) { console.debug(e); }
      }
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;

      const prefill = {
        customerName: saved?.customerName || user?.name || '',
        email: saved?.email || user?.email || '',
        phone: saved?.phone || user?.phone || '',
        address: saved?.address || user?.address || '',
        city: saved?.city || user?.city || '',
        state: saved?.state || user?.state || '',
        pincode: saved?.pincode || user?.pincode || '',
        landmark: saved?.landmark || ''
      };

      form.setFieldsValue(prefill);
      if (prefill.address || prefill.city || prefill.phone) {
        setSavedProfileAddress(prefill);
      }
    } catch (e) { console.debug(e); }
  }, [form]);

  // Calculations
  const subtotal = cartItems.reduce(
    (acc, item) => acc + (Number(item.price) || 0) * (parseInt(item.quantity, 10) || 1),
    0
  );
  const finalTotal = Math.max(0, subtotal - discountAmount - rewardDiscountAmount);

  // Patron Privilege Points Toggle handler in checkout
  const handleToggleRewards = async () => {
    if (rewardLoading) return;
    if (rewardPointsUsed > 0) {
      await handleRemoveRewards();
    } else {
      if (availableRewardPoints <= 0) {
        message.info('You have 0 privilege points available. Earn points on this order!');
        return;
      }
      const maxPtsBySubtotal = Math.floor(subtotal / (rewardRate / 100));
      const pointsToApply = Math.min(availableRewardPoints, maxPtsBySubtotal);
      if (pointsToApply <= 0) {
        message.warning('Subtotal is too low to redeem privilege points.');
        return;
      }

      setRewardLoading(true);
      try {
        const hadCoupon = Boolean(appliedCoupon?.code);
        await cartService.applyRewards(pointsToApply);
        if (hadCoupon) {
          message.success(`${pointsToApply.toLocaleString()} wallet points applied. Coupon removed (only one discount applies at a time).`);
        } else {
          message.success(`${pointsToApply.toLocaleString()} privilege points applied! (Saved ₹${Math.floor(pointsToApply * (rewardRate / 100)).toLocaleString('en-IN')})`);
        }
        await loadCartState();
      } catch (err) {
        if (err?.isHandledAuth) return;
        message.error(err.message || 'Failed to apply reward points.');
      } finally {
        setRewardLoading(false);
      }
    }
  };

  // Patron Privilege Points Remove handler
  const handleRemoveRewards = async () => {
    setRewardLoading(true);
    try {
      await cartService.removeRewards();
      message.info('Loyalty privilege points discount removed.');
      await loadCartState();
    } catch (err) {
      if (err?.isHandledAuth) return;
      message.error(err.message || 'Failed to remove reward points.');
    } finally {
      setRewardLoading(false);
    }
  };

  // Toggle delivery address to gift recipient
  const handleToggleGiftAddress = (checked) => {
    setUseGiftAddress(checked);
    if (checked && giftOptions) {
      form.setFieldsValue({
        customerName: giftOptions.recipientName || form.getFieldValue('customerName'),
        phone: giftOptions.recipientPhone || form.getFieldValue('phone'),
        address: giftOptions.recipientAddress || form.getFieldValue('address')
      });
    } else {
      // Revert to user profile
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          form.setFieldsValue({
            customerName: user.name || '',
            phone: user.phone || '',
            address: user.address || ''
          });
        }
      } catch (e) { console.debug(e); }
    }
  };

  const handlePlaceOrder = async (values) => {
    if (cartItems.length === 0) {
      message.warning('Your shopping bag is empty.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      // Construct verified delivery address
      const fullAddress = [
        values.address,
        values.landmark,
        values.city,
        values.state,
        values.pincode
      ].filter(Boolean).join(', ');

      // Persist address to boutique profile & cache if selected
      if (saveAddressForFuture) {
        try {
          const addrObj = {
            customerName: values.customerName?.trim() || '',
            email: values.email?.trim() || '',
            phone: values.phone?.trim() || '',
            address: values.address?.trim() || '',
            city: values.city?.trim() || '',
            state: values.state?.trim() || '',
            pincode: values.pincode?.trim() || '',
            landmark: values.landmark?.trim() || ''
          };
          localStorage.setItem('rove_amber_saved_address', JSON.stringify(addrObj));
          setSavedProfileAddress(addrObj);
          
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const u = JSON.parse(userStr);
            u.phone = u.phone || addrObj.phone;
            u.address = addrObj.address;
            u.city = addrObj.city;
            u.state = addrObj.state;
            u.pincode = addrObj.pincode;
            localStorage.setItem('user', JSON.stringify(u));
          }

          authService.updateProfile({
            phone: addrObj.phone,
            address: addrObj.address,
            city: addrObj.city,
            state: addrObj.state,
            pincode: addrObj.pincode
          }).catch(() => {});
        } catch (e) { console.debug(e); }
      }

      const orderPayload = {
        customerName: values.customerName.trim(),
        email: values.email?.trim() || '',
        phone: values.phone.trim(),
        address: fullAddress,
        paymentMethod: 'Razorpay',
        isGift: !!giftOptions?.isGift,
        occasion: giftOptions?.occasion || '',
        giftMessage: giftOptions?.messageText || '',
        giftWrap: !!giftOptions?.isGift,
        giftRecipient: giftOptions ? {
          name: giftOptions.recipientName || '',
          phone: giftOptions.recipientPhone || '',
          address: giftOptions.recipientAddress || ''
        } : {},
        couponCode: appliedCoupon?.code || '',
        discountAmount: discountAmount || 0,
        rewardPointsUsed: rewardPointsUsed || 0,
        rewardDiscountAmount: rewardDiscountAmount || 0,
        hasSample: cartItems.some(i => i.hasSample || String(i.size || '').toLowerCase().includes('2ml') || String(i.name || '').toLowerCase().includes('sample')),
        items: cartItems.map((item) => ({
          productId: item.productId || item.id,
          name: item.name || '',
          price: Number(item.price) || 0,
          quantity: parseInt(item.quantity, 10) || 1,
          size: item.size || '50ml',
          image: item.image || '',
          hasSample: Boolean(item.hasSample || String(item.size || '').toLowerCase().includes('2ml') || String(item.name || '').toLowerCase().includes('sample'))
        }))
      };

      // ONLINE PAYMENT VIA RAZORPAY GATEWAY
      const initRes = await paymentService.createPaymentOrder(orderPayload);
      if (!initRes?.success || !initRes?.data) {
        throw new Error(initRes?.message || 'Failed to initialize Razorpay payment order.');
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || typeof window === 'undefined' || !window.Razorpay) {
        throw new Error('Razorpay SDK failed to load. Please check your network connection.');
      }

      const { razorpayOrderId, amount, currency, keyId, orderId, internalId } = initRes.data;

      const rzpOptions = {
        key: keyId || 'rzp_test_Tq87qYzkJmzGUc',
        amount: amount,
        currency: currency || 'INR',
        name: 'ROVE & AMBER',
        description: `Order ${orderId || ''} • Luxury Fragrance Formulation`,
        image: '/images/perfumes/rove_amber_exact_banner_hd.jpg',
        order_id: razorpayOrderId,
        prefill: {
          name: values.customerName.trim(),
          email: values.email?.trim() || '',
          contact: values.phone.trim()
        },
        notes: {
          orderId: orderId,
          deliveryAddress: fullAddress
        },
        theme: {
          color: '#1A1412'
        },
        handler: async function (razorpayResponse) {
          setLoading(true);
          try {
            const verifyRes = await paymentService.verifyPayment({
              razorpay_order_id: razorpayResponse.razorpay_order_id,
              razorpay_payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_signature: razorpayResponse.razorpay_signature,
              orderId: orderId || internalId
            });

            if (verifyRes?.success) {
              const confirmedOrder = verifyRes.data?.order || {
                orderId: orderId,
                customer_name: values.customerName.trim(),
                phone: values.phone.trim(),
                address: fullAddress,
                paymentMethod: 'Razorpay',
                total_amount: (amount / 100),
                paymentStatus: 'Paid'
              };
              setOrderConfirmed(confirmedOrder);
              cartService.clearCart();
              try {
                localStorage.removeItem('rove_amber_gift_options');
              } catch (e) { console.debug(e); }
              message.success('Payment verified! Your luxury order has been confirmed.');
            } else {
              message.error(verifyRes?.message || 'Payment signature verification failed.');
            }
          } catch (vErr) {
            console.error('Payment verification error:', vErr);
            message.error(vErr.response?.data?.message || 'Verification error after payment.');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            message.info('Payment checkout window was closed.');
            paymentService.recordPaymentFailure({
              razorpay_order_id: razorpayOrderId,
              orderId: orderId,
              error: { description: 'Checkout window closed by customer' }
            }).catch(() => {});
          }
        }
      };

      const rzpInstance = new window.Razorpay(rzpOptions);

      rzpInstance.on('payment.failed', function (failResp) {
        console.error('Razorpay payment failed:', failResp.error);
        message.error(failResp.error?.description || 'Payment was declined or failed.');
        paymentService.recordPaymentFailure({
          razorpay_order_id: razorpayOrderId,
          orderId: orderId,
          error: failResp.error
        }).catch(() => {});
        setLoading(false);
      });

      rzpInstance.open();
    } catch (err) {
      console.error('Order creation error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Unable to connect to order atelier. Please verify your connection.';
      setErrorMessage(errMsg);
      message.error(errMsg);
    } finally {
      // Keep loading false on error; on success, handler or COD turns it off
      setLoading(false);
    }
  };

  if (!isClient || isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#FAF9F7] font-sans text-black flex flex-col justify-between">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center py-32 space-y-4">
          <Spin size="large" />
          <p className="text-xs uppercase tracking-widest text-[#8C7A6B] font-semibold">
            Verifying Authentication...
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  const walletCashValue = Math.floor((availableRewardPoints || 0) * ((rewardRate || 100) / 100));
  const pointsPerRupee = (rewardRate || 100) > 0 ? Math.round(100 / (rewardRate || 100)) : 10;
  const pointsToEarn = Math.floor(((finalTotal || 0) / 100) * (pointsPerHundred || 10));

  return (
    <div className="min-h-screen bg-[#FAF9F7] font-sans text-black flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-22 md:pt-24 pb-12 w-full flex-1">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3 sm:mb-4 uppercase tracking-widest">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <span>/</span>
          <Link href="/cart" className="hover:text-black transition-colors">Shopping Bag</Link>
          <span>/</span>
          <span className="text-black font-semibold">Secure Checkout</span>
        </div>

        {orderConfirmed ? (
          /* ================= ORDER SUCCESS CONFIRMATION ================= */
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-[#E8DFC9] shadow-sm text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-[#FAF3E0] text-[#B8860B] border border-[#E0D0A5] flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 size={40} />
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#8C6D1F] block mb-1">
                Atelier Order Registered
              </span>
              <h1 className="text-3xl sm:text-4xl font-serif font-normal text-black tracking-tight">
                Thank You for Your Patronage
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 font-light mt-2 max-w-md mx-auto leading-relaxed">
                Your flacon formulations have entered our fragrance compounding studio. A confirmation dispatch has been dispatched to your email.
              </p>
            </div>

            {/* Order Summary Box */}
            <div className="p-5 bg-[#FAF9F7] rounded-2xl border border-[#E8DFC9] text-left space-y-3 text-xs">
              <div className="flex justify-between pb-3 border-b border-[#E8DFC9]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Order Reference</span>
                  <span className="font-mono font-bold text-base text-black">
                    {orderConfirmed.orderId || `#ORD-${orderConfirmed.id || orderConfirmed._id}`}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Investment</span>
                  <span className="font-sans font-bold text-base text-[#1A1A1A]">
                    ₹{(orderConfirmed.total_amount || finalTotal).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-gray-400 block">Recipient</span>
                  <span className="font-semibold text-black">{orderConfirmed.customer_name || 'Valued Patron'}</span>
                  <span className="text-gray-500 block text-[11px]">{orderConfirmed.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-gray-400 block">Payment Method</span>
                  <span className="font-semibold text-black">{orderConfirmed.paymentMethod || paymentMethod}</span>
                  <span className="text-emerald-700 font-semibold block text-[11px]">Confirmed via Secure Gateway</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-gray-400 block">Dispatch Destination</span>
                <span className="text-gray-700 block text-[11px] leading-relaxed">{orderConfirmed.address}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.push('/profile?tab=orders')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-black hover:bg-[#262626] text-white text-xs font-bold uppercase tracking-widest transition-all cursor-pointer shadow-xs"
              >
                Track in My Orders
              </button>
              <button
                type="button"
                onClick={() => router.push('/shop')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white hover:bg-stone-50 text-stone-700 border border-[#E0D8CA] text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
              >
                Continue Exploring
              </button>
            </div>
          </div>
        ) : isCheckoutLoading ? (
          /* ================= UNIFIED SINGLE-CARD SKELETON ================= */
          <div className="bg-white rounded-3xl border border-[#E8DFC9] shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 animate-pulse">
            {/* Left Column Skeleton */}
            <div className="lg:col-span-7 xl:col-span-7 p-4 sm:p-5 border-b lg:border-b-0 lg:border-r border-[#ECE7DE] space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#ECE7DE]">
                <div className="h-4 w-44 bg-[#ECE7DE] rounded" />
                <div className="h-4 w-24 bg-[#F4EFE6] rounded-full" />
              </div>
              <div className="h-10 rounded-xl bg-[#FAF9F7] border border-[#EAE3D2]" />
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="h-9 rounded-lg bg-[#FAF9F7] border border-[#ECE7DE]" />
                <div className="h-9 rounded-lg bg-[#FAF9F7] border border-[#ECE7DE]" />
              </div>
              <div className="h-9 rounded-lg bg-[#FAF9F7] border border-[#ECE7DE]" />
              <div className="grid grid-cols-3 gap-2">
                <div className="h-9 rounded-lg bg-[#FAF9F7] border border-[#ECE7DE]" />
                <div className="h-9 rounded-lg bg-[#FAF9F7] border border-[#ECE7DE]" />
                <div className="h-9 rounded-lg bg-[#FAF9F7] border border-[#ECE7DE]" />
              </div>
            </div>

            {/* Right Column Skeleton */}
            <div className="lg:col-span-5 xl:col-span-5 bg-[#FAF8F5] p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#ECE7DE]">
                <div className="h-4 w-32 bg-[#ECE7DE] rounded" />
                <div className="h-4 w-16 bg-[#F4EFE6] rounded" />
              </div>
              <div className="h-14 rounded-xl bg-white border border-[#EAE3D2]" />
              <div className="space-y-2 pt-2 border-t border-[#ECE7DE]">
                <div className="h-3 w-full bg-[#F4EFE6] rounded" />
                <div className="h-3 w-3/4 bg-[#F4EFE6] rounded" />
                <div className="h-4 w-full bg-[#ECE7DE] rounded mt-2" />
              </div>
              <div className="h-10 rounded-xl bg-[#FAF0D4]/60 border border-[#EAE3D2]" />
              <div className="h-11 rounded-xl bg-stone-900/80 mt-2" />
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          /* ================= EMPTY BAG CHECKOUT GUARD ================= */
          <div className="max-w-md mx-auto py-16 text-center space-y-4">
            <h2 className="text-2xl font-serif font-normal">Your Shopping Bag is Empty</h2>
            <p className="text-xs text-gray-500">Please select fine fragrance flacons before proceeding to checkout.</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black text-white text-xs font-bold uppercase tracking-widest"
            >
              <span>Explore Fragrance Catalog</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        ) : (
          <Form
            id="checkout-form"
            form={form}
            layout="vertical"
            onFinish={handlePlaceOrder}
            requiredMark={false}
          >
            {/* UNIFIED SINGLE-CARD LUXURY CHECKOUT ATELIER */}
            <div className="bg-white rounded-3xl border border-[#E8DFC9] shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
              
              {/* LEFT COLUMN: DISPATCH & RECIPIENT INFORMATION (7 Cols) */}
              <div className="lg:col-span-7 xl:col-span-7 p-4 sm:p-5 border-b lg:border-b-0 lg:border-r border-[#ECE7DE] flex flex-col justify-between space-y-3">
                <div className="space-y-3">
                  {/* Server Error Alert */}
                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2">
                      <AlertCircle size={14} className="shrink-0 mt-0.5 text-red-600" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Compact Dispatch Header */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#ECE7DE]">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#1C1714] text-[#ECC880] flex items-center justify-center text-[11px] font-bold">1</div>
                      <h2 className="font-serif text-sm sm:text-base font-bold text-[#1C1714] m-0">
                        Dispatch & Delivery Destination
                      </h2>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Pan-India Delivery
                      </span>
                    </div>
                  </div>

                  {/* SAVED ADDRESS SELECTION CARD */}
                  {savedProfileAddress && (savedProfileAddress.address || savedProfileAddress.city) && (
                    <div
                      onClick={handleFillSavedAddress}
                      role="button"
                      tabIndex={0}
                      className="p-3 sm:p-3.5 rounded-2xl bg-[#FCFAF6] hover:bg-[#F7F2E8] border border-[#D9CEBA] hover:border-[#B8860B] transition-all cursor-pointer shadow-2xs group flex items-center justify-between gap-3 text-left"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#1C1714] text-[#ECC880] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs group-hover:scale-105 transition-transform">
                          <Home size={14} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-[#1C1714]">Saved Address</span>
                            <span className="text-[10px] text-[#8C6D1F] bg-[#FAF1D9] border border-[#E5D7B3] px-2 py-0.5 rounded-full font-semibold">
                              Click to Fill & Edit
                            </span>
                          </div>
                          <p className="text-[11.5px] text-[#5C5248] mt-1 font-normal truncate">
                            {[
                              savedProfileAddress.customerName,
                              savedProfileAddress.address,
                              savedProfileAddress.city,
                              savedProfileAddress.state,
                              savedProfileAddress.pincode
                            ].filter(Boolean).join(', ')}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleFillSavedAddress}
                        className="px-3 py-1.5 rounded-lg bg-[#1C1714] text-[#ECC880] text-[11px] font-bold shrink-0 hover:bg-[#2E241E] transition-colors group-hover:shadow-xs cursor-pointer"
                      >
                        Use Address
                      </button>
                    </div>
                  )}

                  {/* Subtle Gift Order Reassurance (Configured in Bag) */}
                  {giftOptions?.isGift && (
                    <div className="p-2.5 rounded-xl bg-gradient-to-r from-[#FAF6EC] to-[#F5ECE0] border border-[#D4AF37]/50 flex items-center justify-between gap-2 shadow-2xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <Gift size={14} className="text-[#8C6D1F] shrink-0" />
                        <span className="text-xs font-semibold text-[#1C1714] truncate">
                          Artisanal Gift Order for <strong className="font-bold">{giftOptions.recipientName}</strong>
                        </span>
                        <span className="text-[10px] text-[#8C6D1F] bg-[#FAF1D9] border border-[#E5D7B3] px-2 py-0.5 rounded-full font-medium shrink-0">
                          {giftOptions.occasion || 'Gift Box Included'}
                        </span>
                      </div>
                      <Link
                        href="/cart"
                        className="text-[10.5px] font-bold text-[#8C6D1F] hover:text-black underline uppercase tracking-wider shrink-0"
                      >
                        Edit in Bag
                      </Link>
                    </div>
                  )}

                  {/* COMPACT & ERGONOMIC DELIVERY FORM */}
                  <div className="space-y-2.5">
                    {/* Row 1: Full Name & Mobile Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <Form.Item
                        label={<span className="text-[11px] font-semibold text-[#2D241E]">Full Name *</span>}
                        name="customerName"
                        rules={[{ required: true, message: 'Please enter your name' }]}
                        className="mb-0"
                      >
                        <Input
                          prefix={<User size={13} className="text-[#B8860B]/70 mr-1" />}
                          placeholder="Shahal Rahman"
                          className="rounded-lg text-xs py-1.5 bg-white border-[#D9CEBA] hover:border-[#B8860B] focus:border-[#B8860B] shadow-2xs"
                        />
                      </Form.Item>

                      <Form.Item
                        label={<span className="text-[11px] font-semibold text-[#2D241E]">Mobile Phone (OTP & Courier SMS) *</span>}
                        name="phone"
                        rules={[
                          { required: true, message: 'Please provide mobile number' },
                          { min: 10, message: '10 digits required' }
                        ]}
                        className="mb-0"
                      >
                        <Input
                          addonBefore={<span className="font-bold text-[11px] text-[#1C1714]">🇮🇳 +91</span>}
                          placeholder="9876543210"
                          maxLength={10}
                          className="rounded-lg text-xs py-1 bg-white border-[#D9CEBA] hover:border-[#B8860B] focus:border-[#B8860B] shadow-2xs"
                        />
                      </Form.Item>
                    </div>

                    {/* Row 2: Email Address */}
                    <Form.Item
                      label={<span className="text-[11px] font-semibold text-[#2D241E]">Email Address (For Dispatch Tracking & Tax Invoice) *</span>}
                      name="email"
                      rules={[
                        { required: true, message: 'Please provide email' },
                        { type: 'email', message: 'Valid email required' }
                      ]}
                      className="mb-0"
                    >
                      <Input
                        prefix={<Mail size={13} className="text-[#B8860B]/70 mr-1" />}
                        placeholder="patron@example.com"
                        className="rounded-lg text-xs py-1.5 bg-white border-[#D9CEBA] hover:border-[#B8860B] focus:border-[#B8860B] shadow-2xs"
                      />
                    </Form.Item>

                    {/* Row 3: Street Address */}
                    <Form.Item
                      label={<span className="text-[11px] font-semibold text-[#2D241E]">Street Address, Apartment / Villa No. *</span>}
                      name="address"
                      rules={[{ required: true, message: 'Please enter street address' }]}
                      className="mb-0"
                    >
                      <Input
                        prefix={<MapPin size={13} className="text-[#B8860B]/70 mr-1" />}
                        placeholder="House / Flat No., Apartment / Society Name, Street / Avenue"
                        className="rounded-lg text-xs py-1.5 bg-white border-[#D9CEBA] hover:border-[#B8860B] focus:border-[#B8860B] shadow-2xs"
                      />
                    </Form.Item>

                    {/* Row 4: City, State, PIN Code */}
                    <div className="grid grid-cols-3 gap-2">
                      <Form.Item
                        label={<span className="text-[11px] font-semibold text-[#2D241E]">City *</span>}
                        name="city"
                        rules={[{ required: true, message: 'Required' }]}
                        className="mb-0"
                      >
                        <Input
                          placeholder="e.g. Mumbai"
                          className="rounded-lg text-xs py-1.5 bg-white border-[#D9CEBA] hover:border-[#B8860B] shadow-2xs"
                        />
                      </Form.Item>

                      <Form.Item
                        label={<span className="text-[11px] font-semibold text-[#2D241E]">State *</span>}
                        name="state"
                        rules={[{ required: true, message: 'Required' }]}
                        className="mb-0"
                      >
                        <Input
                          placeholder="e.g. Maharashtra"
                          className="rounded-lg text-xs py-1.5 bg-white border-[#D9CEBA] hover:border-[#B8860B] shadow-2xs"
                        />
                      </Form.Item>

                      <Form.Item
                        label={<span className="text-[11px] font-semibold text-[#2D241E]">PIN Code *</span>}
                        name="pincode"
                        rules={[
                          { required: true, message: 'Required' },
                          { pattern: /^[0-9]{6}$/, message: '6 digits' }
                        ]}
                        className="mb-0"
                      >
                        <Input
                          placeholder="e.g. 400001"
                          maxLength={6}
                          className="rounded-lg text-xs py-1.5 bg-white border-[#D9CEBA] hover:border-[#B8860B] shadow-2xs"
                        />
                      </Form.Item>
                    </div>
                  </div>
                </div>

                {/* Form Footer Strip */}
                <div className="pt-2.5 border-t border-[#ECE7DE] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={saveAddressForFuture}
                      onChange={(e) => setSaveAddressForFuture(e.target.checked)}
                      className="rounded border-[#D5C9B8] accent-[#1C1714] w-3.5 h-3.5 cursor-pointer"
                    />
                    <span className="text-[11px] text-[#4A3E31]">
                      Save address to profile for future acquisitions
                    </span>
                  </label>

                  <span className="inline-flex items-center gap-1 text-[10.5px] text-gray-400">
                    <ShieldCheck size={12} className="text-emerald-600" />
                    <span>White-Glove Delhivery Courier • Insured</span>
                  </span>
                </div>
              </div>

              {/* RIGHT COLUMN: ORDER SUMMARY & RAZORPAY PAYMENT (5 Cols) */}
              <div className="lg:col-span-5 xl:col-span-5 bg-[#FAF8F5] p-4 sm:p-5 flex flex-col justify-between space-y-3">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-[#ECE7DE]">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-serif font-bold text-black m-0">
                        Order Summary ({cartItems.length} {cartItems.length === 1 ? 'Flacon' : 'Flacons'})
                      </h3>
                    </div>
                    <Link href="/cart" className="text-xs text-[#8C6D1F] hover:underline font-semibold">
                      Edit Bag
                    </Link>
                  </div>

                  {/* Compact Flacon Items */}
                  <div className="space-y-2 max-h-24 sm:max-h-28 overflow-y-auto pr-1">
                    {cartItems.map((item, idx) => (
                      <div key={`${item.productId || item.id}-${item.size || idx}`} className="flex items-center gap-2.5 pb-2 border-b border-gray-100 last:border-0 last:pb-0">
                        <div className="w-8 h-10 rounded-lg bg-white p-0.5 border border-[#E8DFC8] flex items-center justify-center shrink-0 overflow-hidden">
                          <img
                            src={getImageUrl(item.image, '/images/no-image.jpg')}
                            alt={item.name}
                            className="w-full h-full object-contain"
                            onError={(e) => { e.currentTarget.src = '/images/no-image.jpg'; }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-serif font-semibold text-xs text-black truncate">{item.name}</h4>
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                            <span className="font-mono">{item.size || '50ML'}</span>
                            <span>•</span>
                            <span>Qty: {item.quantity}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-xs text-black font-sans">
                            ₹{((Number(item.price) || 0) * (parseInt(item.quantity, 10) || 1)).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Accurate Pricing Breakdown with Free Delivery */}
                  <div className="space-y-2 pt-2 border-t border-[#ECE7DE] text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
                      <span className="font-bold text-black font-sans">₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between text-gray-600 items-center">
                      <span className="flex items-center gap-1">
                        <Truck size={12} className="text-[#B8860B]" />
                        <span>White-Glove Courier Delivery</span>
                      </span>
                      <span className="text-emerald-700 font-bold uppercase text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        FREE
                      </span>
                    </div>

                    {discountAmount > 0 && appliedCoupon && (
                      <div className="flex justify-between items-center text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        <span className="font-bold uppercase tracking-wider text-[10.5px] flex items-center gap-1">
                          <Tag size={11} className="text-emerald-700" />
                          Privilege Discount ({appliedCoupon.code})
                        </span>
                        <span className="font-sans font-bold text-emerald-700">-₹{discountAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    {rewardDiscountAmount > 0 && (
                      <div className="flex justify-between items-center text-[#8C6D1F] bg-gradient-to-r from-[#FAF6EC] to-[#F5ECE0] px-2.5 py-1.5 rounded-lg border border-[#D4AF37]/50 shadow-2xs">
                        <span className="font-semibold text-xs text-[#6B5115] tracking-wide truncate">
                          Wallet Credit
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="font-sans font-bold text-xs text-[#8C6D1F]">-₹{rewardDiscountAmount.toLocaleString('en-IN')}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveRewards();
                            }}
                            disabled={rewardLoading}
                            className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-stone-400 hover:text-red-600 text-[10px] cursor-pointer"
                            title="Remove points"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-baseline pt-2 border-t border-[#ECE7DE]">
                      <span className="font-sans font-bold text-sm text-black">Total Amount</span>
                      <span className="font-sans text-xl font-bold text-black tracking-tight">
                        ₹{finalTotal.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Privilege Points Earned on this Purchase */}
                    {pointsToEarn > 0 && (
                      <div className="p-2.5 rounded-xl bg-gradient-to-r from-[#FAF6EC] to-[#F5ECE0] border border-[#E8DFC9] flex items-center justify-between gap-2 shadow-2xs mt-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-lg bg-[#FAF0D4] border border-[#E0D0A5] flex items-center justify-center text-[#B8860B] shrink-0">
                            <Sparkles size={13} />
                          </div>
                          <span className="text-xs text-[#6B5115] font-medium leading-tight">
                            You will earn <strong className="font-bold text-[#B8860B]">+{pointsToEarn.toLocaleString('en-IN')} Privilege Points</strong> on this order
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white text-[#8C6D1F] border border-[#E8DEC8] shrink-0">
                          +{pointsPerHundred} pts / ₹100
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Patron Privilege Wallet Toggle (Compact & Simple) */}
                  <div 
                    onClick={handleToggleRewards}
                    className={`p-2.5 sm:p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none ${
                      rewardPointsUsed > 0 
                        ? 'bg-gradient-to-r from-[#FAF6EC] to-[#F5ECE0] border-[#D4AF37]/70 shadow-2xs' 
                        : 'bg-white hover:bg-[#F9F7F2] border-[#E8DFC9] hover:border-[#B8860B]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border shadow-2xs transition-colors ${
                          rewardPointsUsed > 0 
                            ? 'bg-[#B8860B] text-white border-[#8C6D1F]' 
                            : 'bg-[#FAF7F2] text-[#B8860B] border-[#E5DAC6]'
                        }`}>
                          <Wallet size={15} strokeWidth={1.8} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#1A1A1A]">
                              Wallet
                            </span>
                            <span className={`text-[11px] font-sans font-bold px-2 py-0.5 rounded-full shrink-0 inline-flex items-center gap-1 ${
                              rewardPointsUsed > 0
                                ? 'bg-[#B8860B] text-white'
                                : 'bg-[#FAF0D4] text-[#8C6D1F] border border-[#E8DEC8]'
                            }`}>
                              <span>{Number(availableRewardPoints || 0).toLocaleString('en-IN')} pts</span>
                              <span className="font-normal opacity-85">
                                ({walletCashValue > 0 ? `₹${walletCashValue.toLocaleString('en-IN')}` : '₹0'})
                              </span>
                            </span>
                          </div>
                          <p className="text-[11px] text-[#7A6B5D] font-light leading-tight mt-0.5 m-0 truncate">
                            {rewardPointsUsed > 0 
                              ? `✓ Applied ${Number(rewardPointsUsed).toLocaleString('en-IN')} pts (-₹${rewardDiscountAmount.toLocaleString('en-IN')})` 
                              : walletCashValue > 0
                                ? `Redeem ${Number(availableRewardPoints || 0).toLocaleString('en-IN')} pts for ₹${walletCashValue.toLocaleString('en-IN')} off`
                                : `Earn points on every order`}
                          </p>
                        </div>
                      </div>

                      {/* Action: Apply / Remove Button */}
                      {rewardPointsUsed > 0 ? (
                        <button
                          type="button"
                          disabled={rewardLoading}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleRewards();
                          }}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200/80 text-rose-700 hover:text-rose-800 text-xs font-bold transition-all shadow-2xs shrink-0 cursor-pointer disabled:opacity-50 min-w-[66px] flex items-center justify-center gap-1"
                        >
                          {rewardLoading ? (
                            <Loader2 size={11} className="animate-spin" />
                          ) : (
                            'Remove'
                          )}
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={rewardLoading || (availableRewardPoints <= 0 && rewardPointsUsed === 0)}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleRewards();
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-[#1C1714] hover:bg-black text-[#ECC880] text-xs font-bold transition-all shadow-2xs shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {rewardLoading ? (
                            <span className="inline-flex items-center gap-1">
                              <Loader2 size={11} className="animate-spin" />
                              <span>Applying...</span>
                            </span>
                          ) : (
                            'Apply'
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Razorpay Instant Checkout Section */}
                <div className="space-y-3 pt-2.5 border-t border-[#ECE7DE]">
                  <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FCFBF9] border-2 border-[#140E0A] shadow-xs space-y-2.5 transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full border-2 border-[#140E0A] flex items-center justify-center bg-white shrink-0 shadow-2xs">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#140E0A]" />
                        </div>
                        <span className="text-sm sm:text-[15px] font-bold text-stone-950 tracking-tight">
                          Instant Online Payment
                        </span>
                        <RazorpayLogo className="h-4.5 sm:h-5 w-auto ml-1" />
                      </div>
                      <span className="text-[10px] sm:text-[10.5px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wider">
                        Instant
                      </span>
                    </div>

                    {/* Realistic Indian Payment Provider Icons (GPay, PhonePe, Paytm, Cards, NetBanking) */}
                    <div className="flex items-center gap-1.5 flex-wrap pl-7.5">
                      {/* Google Pay */}
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-stone-200 shadow-2xs hover:border-stone-400 transition-colors">
                        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                        </svg>
                        <span className="text-[11px] font-bold text-stone-800 font-sans tracking-tight">GPay</span>
                      </span>

                      {/* PhonePe */}
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#5F259F]/5 border border-[#5F259F]/30 shadow-2xs hover:border-[#5F259F] transition-colors">
                        <span className="w-3.5 h-3.5 rounded-full bg-[#5F259F] text-white flex items-center justify-center text-[8.5px] font-bold shrink-0">
                          पे
                        </span>
                        <span className="text-[11px] font-bold text-[#5F259F] font-sans tracking-tight">PhonePe</span>
                      </span>

                      {/* Paytm */}
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#002E6E]/5 border border-[#00BAF2]/40 shadow-2xs hover:border-[#002E6E] transition-colors">
                        <span className="text-[11.5px] font-extrabold text-[#002E6E] font-sans tracking-tight leading-none">
                          pay<span className="text-[#00BAF2]">tm</span>
                        </span>
                      </span>

                      {/* UPI */}
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50/70 border border-emerald-300 shadow-2xs">
                        <span className="text-[10px] font-extrabold text-emerald-800 font-mono tracking-wider">UPI</span>
                      </span>

                      {/* Cards */}
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-stone-200 shadow-2xs">
                        <CreditCard size={12} className="text-stone-700" />
                        <span className="text-[10.5px] font-semibold text-stone-800">Cards</span>
                      </span>

                      {/* NetBanking */}
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-stone-200 shadow-2xs">
                        <Landmark size={12} className="text-stone-700" />
                        <span className="text-[10.5px] font-semibold text-stone-800">NetBanking</span>
                      </span>
                    </div>

                    <p className="text-[10.5px] sm:text-[11px] text-stone-500 m-0 font-light pl-7.5 leading-tight">
                      Zero transaction fees • Instant UPI confirmation & automated GST tax invoice.
                    </p>
                  </div>

                  {/* Submit Pay Button - Sleek & Compact Luxury Button */}
                  <button
                    type="submit"
                    form="checkout-form"
                    disabled={loading}
                    onClick={() => form.submit()}
                    className="w-full h-11 sm:h-12 px-5 bg-[#140E0A] hover:bg-black active:scale-[0.99] text-[#F3DFBE] rounded-xl font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-50 border border-[#B8860B]/50"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={15} className="animate-spin text-[#ECC880]" />
                        <span>Securing Order...</span>
                      </>
                    ) : (
                      <>
                        <Lock size={14} className="text-[#ECC880]" />
                        <span>Pay ₹{finalTotal.toLocaleString('en-IN')} with Razorpay</span>
                      </>
                    )}
                  </button>

                  {/* Trust Note */}
                  <div className="flex items-center justify-center gap-3 pt-0.5 text-[10.5px] text-gray-400">
                    <span className="flex items-center gap-1"><Lock size={10} className="text-emerald-600" /> 256-Bit SSL</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><ShieldCheck size={10} className="text-emerald-600" /> RBI Compliant</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Truck size={10} className="text-emerald-600" /> Free Insured Delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </Form>
        )}
      </main>

      <Footer />

      {/* Strict Authentication Gate for Checkout */}
      <AuthGateModal
        open={showAuthModal}
        onClose={() => router.replace('/cart')}
        onCancelAction={() => router.replace('/cart')}
        redirectPath="/checkout"
        title="Sign In to Complete Checkout"
        subtitle="Private Checkout Access"
        description="Private checkout requires verified customer authentication. Please sign in or register to complete your order."
        confirmText="Sign In to Checkout"
        cancelText="Return to Shopping Bag"
      />
    </div>
  );
}

