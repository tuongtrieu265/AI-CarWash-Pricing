package com.carwash.controller;

import com.carwash.entity.ServicePackage;
import com.carwash.entity.LoyaltyConfig;
import com.carwash.repository.ServicePackageRepository;
import com.carwash.repository.LoyaltyConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ServicePackageRepository servicePackageRepository;
    private final LoyaltyConfigRepository loyaltyConfigRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @PostMapping
    public ResponseEntity<Map<String, Object>> chat(@RequestBody Map<String, String> request) {
        String userMessage = request.get("message");
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message is required"));
        }

        // Get GEMINI_API_KEY from environment
        String apiKey = System.getenv("GEMINI_API_KEY");
        if (apiKey == null || apiKey.trim().isEmpty()) {
            apiKey = System.getProperty("GEMINI_API_KEY");
        }

        if (apiKey == null || apiKey.trim().isEmpty()) {
            // Mock Fallback Response
            String mockReply = generateMockResponse(userMessage);
            return ResponseEntity.ok(Map.of("reply", mockReply));
        }

        try {
            String systemPrompt = buildSystemPrompt();
            
            // Build request body for Gemini API
            Map<String, Object> requestBody = new HashMap<>();
            
            // System instructions
            Map<String, Object> systemInstruction = new HashMap<>();
            systemInstruction.put("parts", List.of(Map.of("text", systemPrompt)));
            requestBody.put("systemInstruction", systemInstruction);

            // Contents (messages)
            Map<String, Object> userPart = new HashMap<>();
            userPart.put("text", userMessage);
            
            Map<String, Object> contentItem = new HashMap<>();
            contentItem.put("role", "user");
            contentItem.put("parts", List.of(userPart));
            requestBody.put("contents", List.of(contentItem));

            // Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;

            ResponseEntity<Map> responseEntity = restTemplate.postForEntity(url, entity, Map.class);
            Map responseBody = responseEntity.getBody();

            if (responseBody != null && responseBody.containsKey("candidates")) {
                List candidates = (List) responseBody.get("candidates");
                if (!candidates.isEmpty()) {
                    Map candidate = (Map) candidates.get(0);
                    Map content = (Map) candidate.get("content");
                    List parts = (List) content.get("parts");
                    if (!parts.isEmpty()) {
                        Map part = (Map) parts.get(0);
                        String reply = (String) part.get("text");
                        return ResponseEntity.ok(Map.of("reply", reply));
                    }
                }
            }

            return ResponseEntity.ok(Map.of("reply", "Xin lỗi, tôi gặp sự cố khi kết nối dịch vụ xử lý câu hỏi."));

        } catch (Exception e) {
            System.err.println("Gemini API call failed: " + e.getMessage());
            return ResponseEntity.ok(Map.of("reply", generateMockResponse(userMessage)));
        }
    }

    private String buildSystemPrompt() {
        List<ServicePackage> packages = servicePackageRepository.findAll();
        String packagesContext = packages.stream()
                .filter(ServicePackage::getActive)
                .map(p -> String.format("- %s: %s (Thời gian: %d phút, Giá: %s)", 
                        p.getName(), p.getDescription(), p.getDurationMinutes(), p.getPrice()))
                .collect(Collectors.joining("\n"));

        List<LoyaltyConfig> loyaltyConfigs = loyaltyConfigRepository.findAll();
        String loyaltyContext = loyaltyConfigs.stream()
                .map(c -> String.format("- Hạng %s (Từ %d điểm): %s. Giảm giá %d%%, thời gian đặt trước tối đa %d ngày.",
                        c.getTier(), c.getMinPoints(), c.getBenefits(), c.getDiscountPercent(), c.getBookingWindowDays()))
                .collect(Collectors.joining("\n"));

        return "Bạn là trợ lý ảo hỗ trợ khách hàng của trung tâm chăm sóc xe chuyên nghiệp AutoClean.\n" +
                "Địa chỉ: 120 Trần Não, Quận 2, Thủ Đức, TP. Hồ Chí Minh.\n" +
                "Hotline: 1900.8899.\n\n" +
                "Hãy trả lời khách hàng một cách thân thiện, chu đáo, lịch sự và chuyên nghiệp bằng Tiếng Việt. Sử dụng định dạng markdown cho rõ ràng.\n\n" +
                "Thông tin dịch vụ của chúng tôi:\n" +
                packagesContext + "\n\n" +
                "Thông tin ưu đãi thành viên (Loyalty Tiers):\n" +
                loyaltyContext + "\n\n" +
                "Các quy tắc đặt lịch quan trọng:\n" +
                "- Mỗi khách hàng chỉ được đặt tối đa 1 lịch hẹn mỗi ngày để đảm bảo dịch vụ tốt nhất.\n" +
                "- TUY NHIÊN, nếu người dùng đã có lịch hẹn trong ngày hôm nay nhưng lịch đó đã được THANH TOÁN THÀNH CÔNG (trạng thái Đã trả), khách hàng VẪN CÓ THỂ tiếp tục đặt lịch hẹn mới tiếp theo trong ngày hôm đó.\n" +
                "- Khách hàng có thể quy đổi điểm tích lũy thành tiền giảm giá: cứ 100 điểm tích lũy tương đương 10.000đ giảm giá trực tiếp vào hóa đơn.\n" +
                "- Khi khách hàng hủy đơn hàng, điểm tích lũy đã dùng để đổi quà/giảm giá của đơn đó sẽ được hoàn lại đầy đủ vào tài khoản của khách hàng.";
    }

    private String generateMockResponse(String userMessage) {
        String msg = userMessage.toLowerCase();
        if (msg.contains("địa chỉ") || msg.contains("ở đâu") || msg.contains("chỉ đường")) {
            return "AutoClean tọa lạc tại **120 Trần Não, Quận 2, Thủ Đức, TP. Hồ Chí Minh**. Rất hân hạnh được phục vụ bạn!";
        } else if (msg.contains("giá") || msg.contains("dịch vụ") || msg.contains("gói")) {
            return "AutoClean cung cấp các gói dịch vụ:\n" +
                    "- **Basic Wash**: Rửa ngoài, lau khô, dưỡng lốp, lau kính (30 phút)\n" +
                    "- **Premium Wash**: Gói Basic + Hút bụi nội thất, lau taplo, dưỡng sáp (60 phút)\n" +
                    "- **VIP Detailing**: Chăm sóc toàn diện nội ngoại thất, dưỡng da, phủ ceramic (120 phút)\n\n" +
                    "Bạn có thể xem giá và đặt lịch trực tiếp trên Website nhé!";
        } else if (msg.contains("hủy") || msg.contains("hoàn tiền") || msg.contains("điểm")) {
            return "Khi bạn hủy lịch đặt, điểm tích lũy đã sử dụng cho đơn đó sẽ được tự động hoàn lại vào tài khoản của bạn. Đối với thanh toán trước, số tiền sẽ được xử lý hoàn lại theo quy định.";
        } else if (msg.contains("đặt lịch") || msg.contains("mấy lần") || msg.contains("giới hạn")) {
            return "Mỗi khách hàng được đặt lịch tối đa 1 lần mỗi ngày. Tuy nhiên, nếu bạn đã có lịch đặt ngày hôm nay và đã thanh toán thành công, bạn vẫn có thể đặt tiếp lịch mới nhé!";
        } else {
            return "Xin chào! Tôi là trợ lý ảo AutoClean. Tôi có thể giúp gì cho bạn về các gói dịch vụ rửa xe, quy định đặt lịch, hay chương trình ưu đãi thành viên?";
        }
    }
}
