# 100문제 정답과 해설

구현은 가능한 풀이 중 하나다. 같은 입력에서 요구한 결과를 내고 조건을 지키면 다른 코드도 맞다. 출력 공백을 알아보기 쉽도록 필요한 곳은 문자열을 작은따옴표로 감싸 설명했다. 정답을 보기 전에 직접 풀고, 맞힌 이유를 설명할 수 있는지 확인하자.

## 개념 001~030

### 001

`.py`는 Python 소스 텍스트, `.ipynb`는 코드·설명·출력·메타데이터를 셀로 저장한 노트북, `.md`는 마크다운 문서다. 노트북에서는 셀을 임의 순서로 실행할 수 있고 상태는 실행 순서를 따르므로, 화면 순서만으로 실행 순서를 알 수 없다. 커널 재시작 후 위에서 아래로 모두 실행하면 상태 의존성을 확인할 수 있다.

### 002

일반적인 CPython은 소스를 바이트코드로 컴파일하고 인터프리터가 실행한다. 파일이나 노트북 셀은 실행 전에 **전체가 먼저 컴파일**되므로, 어딘가에 SyntaxError가 있으면 그보다 앞줄도 하나도 실행되지 않는다(실행 중 생기는 NameError 같은 런타임 오류는 그 줄에 도달해야 발생한다는 점과 대비된다). 컴파일과 인터프리트는 언어 이름만으로 단순히 둘 중 하나로 나눌 문제가 아니다.

### 003

차례로 `int`, `str`, `float`, `bool`, `complex`, `NoneType`이다. `type()`은 타입 객체를 반환하며 `print()`는 화면에 표시한 뒤 `None`을 반환한다. `<class 'int'>`는 타입을 화면에 표현한 형태다.

### 004

`student_2`, `학교`, `sum`은 문법상 가능하다. 다만 `sum`은 내장 함수를 가리키는 이름이라 덮어쓰지 않는 편이 좋다. `2student`는 숫자로 시작하고, `my-score`는 빼기 연산으로 나뉘며, `True`는 예약어라 변수 이름으로 쓸 수 없다. 이름 관례와 문법 규칙은 구분한다.

### 005

y는 처음 정수 10에 연결되고 x만 20으로 다시 연결된다. 반면 a와 b는 같은 변경 가능한 리스트를 가리키므로 `b.append(1)`은 공유 리스트를 바꿔 a에도 `[1]`이 보인다. 이름 재대입과 객체 변경의 차이다. 문제의 세미콜론은 단순 문장들을 같은 줄에 나누어 적는 구분자다.

### 006

`#`는 문자열 밖에서 줄 끝까지 주석이다. 세 따옴표는 여러 줄 문자열이며, 함수·모듈의 첫 설명 위치에서는 docstring이 될 수 있다. 문자열 안의 `#`는 글자다. 곡선 따옴표는 일반 `'`, `"`처럼 소스의 문자열 구분자로 쓸 수 없다.

### 007

`x+1`은 표현식, `x=1`은 대입문이다. `print('A')`는 호출 표현식이면서 단독 한 줄이면 표현식 문장이다. `lambda x:x`는 함수 객체를 만드는 표현식이다. `if`는 조건문(복합 문장)을 시작하는 키워드라 그 자체로는 값이 되는 표현식이 아니다(조건 표현식 `A if c else B`의 일부로는 쓰인다). `print`라는 이름 자체도 객체를 참조하는 표현식이다.

### 008

`input()`은 `str`을 반환한다. `int('8')`은 8, `int('8.2')`는 ValueError, `int(-8.2)`는 -8, `float('8')`은 8.0이다. 소수 문자열을 정수로 직접 읽는 것과 실수를 정수로 바꾸는 것은 다른 경우다.

### 009

`split()`은 연속 공백류와 앞뒤 공백을 처리해 조각을 만든다. `split(' ')`은 공백 하나마다 분리해 빈 조각을 만들 수 있다. 실행 순서는 input → split의 문자열 리스트 → map의 원소별 int 적용 → 언패킹이다. map은 결과를 필요할 때 만드는 소모성 이터레이터, list는 결과 원소를 모아 둔 자료구조다.

### 010

`sep`는 같은 print 호출의 인수 사이, `end`는 끝에 덧붙일 문자열이다. 주어진 코드는 `A:B!`를 줄바꿈 없이 쓴다. `print(a+b)`는 먼저 + 연산한 값 하나, `print(a,b)`는 별도 인수 두 개를 표시한다. 후자는 문자열과 정수도 함께 출력할 수 있다.

### 011

`/`는 일반 나눗셈, `//`는 내림한 몫, `%`는 나머지다. b가 0이 아닐 때 제시한 관계가 맞는다. int는 0 방향으로 소수 부분을 버리지만 //는 음의 무한대 방향으로 내리므로, 음의 비정수 몫에서 결과가 다르다.

### 012

`**`는 거듭제곱, `^`는 비트 XOR이다. `-3**2`는 -9, `(-3)**2`는 9다. 수학식 b/(2a)는 `b/(2*a)`다. 수학의 곱셈 기호 생략은 Python에서 허용되지 않는다.

### 013

정수에 `/=`를 적용하면 일반 나눗셈 결과인 float가 된다. 0은 덧셈의 항등원, 1은 곱셈의 항등원이다. 누적곱을 0에서 시작하면 어떤 수를 곱해도 0이다.

### 014

앞 세 방식은 모두 `'00000101'` 문자열, bin은 `'0b101'` 문자열을 만든다. 앞의 0 채움과 접두사 유무가 다르다. 폭은 최소값이라 256의 이진수는 9자리로 그대로 나온다.

### 015

`{0}`은 첫 위치 인수, `{name}`은 이름 인수, `{1:*>10}`은 두 번째 인수를 별로 채워 폭 10 오른쪽 정렬한다. `%6.1f`는 최소 폭 6·소수 1자리 실수, `,d`는 정수의 세 자리 구분 쉼표, `c`는 정수 코드 포인트의 문자 표시다. 쓰지 않은 여분 인수는 허용되지만 없는 인수를 참조하면 IndexError 또는 이름 필드의 KeyError가 생길 수 있다. 자동·수동 위치 번호 혼합은 ValueError다.

### 016

8비트, 256가지, 0~255다. Python int는 필요한 만큼 큰 정수를 표현하고 str은 유니코드 문자열이다. 코드 포인트와 실제 인코딩 바이트 수를 구분해야 한다.

### 017

ord는 한 글자 → 정수, chr은 정수 → 한 글자, bin은 정수 → 0b가 붙은 이진수 문자열, `int(text,2)`는 이진수 문자열 → 정수다. `ord('AB')`는 길이가 2여서 TypeError다. 코드 포인트 정수와 UTF-8 바이트열은 다른 개념이다.

### 018

`==`는 값, `is`는 동일 객체, `in`은 포함 여부를 검사한다. 내용이 같은 별개 리스트는 ==가 참, is가 거짓이다. 작은 정수나 상수는 재사용될 수 있어 is의 참을 값 비교의 보장으로 해석하면 안 된다. 값은 ==로 비교한다.

### 019

우선순위는 not → and → or다. 앞에서 결과가 결정되면 뒤 표현식을 평가하지 않는다. and/or는 선택된 피연산자를 반환할 수 있어 항상 bool은 아니다. `0 or 9`는 9이므로 “논리 연산은 항상 bool을 반환한다”는 말과 **양립하지 않는다**. 다만 not은 항상 bool을 반환한다.

### 020

`&`는 비트 AND, `|`는 OR, `^`는 XOR, `~`는 반전, `<<`와 `>>`는 시프트다. Python의 `~5`는 -6이며 고정 8비트에서 뒤집은 250과 다르다. MSB는 정해진 표현 폭의 최상위 비트, LSB는 최하위 비트다. 8비트 결과만 남기려면 `& 0xff`를 쓴다.

### 021

독립 if는 여러 개가 실행될 수 있고, if/elif는 처음 참인 한 분기만 실행한다. 탈락을 우선해야 하는데 합격을 먼저 검사하면 높은 점수의 결석 과다자를 잘못 통과시킬 수 있다.

### 022

if 문은 실행할 블록을 고르고, 조건 표현식은 값 하나를 고른다. else는 같은 들여쓰기의 해당 if와 짝지어진다. 가까워 보이는 줄보다 들여쓰기 구조가 우선이다.

### 023

시작값 준비 → 조건 검사 → 본문 → 갱신 → 재검사다. 처음 거짓이면 본문은 0회 실행된다. 갱신이 없으면 조건이 계속 참으로 남아 무한 반복될 수 있다.

### 024

각각 0~4, 1~4, 5·4·3·2다. stop은 제외한다. step이 0이면 ValueError다. 단계 방향으로 종료 경계에 접근할 수 없으면 빈 수열이다. range는 리스트 자체가 아니다.

### 025

break는 가장 안쪽 반복문에서 탈출한다. sys.exit()는 SystemExit를 일으켜 스크립트를 종료하는 용도로 쓰이며 노트북 동작은 실행 환경도 관여한다. Ctrl+C는 실행 중단 요청이다. 중첩 반복에서 break 하나로 두 반복 모두 끝나지 않는다.

### 026

리스트 `[]`는 순서·변경·중복이 가능하다. 튜플은 쉼표로 묶고 대개 `()`로 표시하며 원소 대입이 불가능하다. 집합 `{값,...}`은 중복이 없고 위치 순서를 보장하지 않는다. 딕셔너리 `{키:값}`은 키로 값을 찾는다. 빈 집합은 set(), {}는 빈 딕셔너리다. append(x)는 뒤에 한 개, insert(i, x)는 i 앞에 한 개를 추가하며 둘 다 None을 반환한다. 저장 순서가 있다는 것과 크기순 정렬은 다르다.

### 027

enumerate는 번호·원소 쌍, matrix[1][2]는 두 번째 행의 세 번째 열을 뜻한다. n에 재대입하는 것은 원본 리스트의 원소 칸에 대입하는 것이 아니다. 원소를 바꾸려면 `nums[i]=...`처럼 해당 칸을 지정한다.

### 028

def는 함수 정의, 매개변수는 정의할 때 쓰는 이름, 인수는 호출할 때 전달하는 값, return은 결과를 돌려주고 종료한다. lambda는 한 표현식을 반환하는 함수를 만들고 map은 함수를 각 요소에 적용한다. 컴프리헨션은 표현식으로 새 리스트를 만든다. 음수를 0으로 바꾸면 길이를 유지하지만 제외하면 원소 수가 줄 수 있다.

### 029

datetime 모듈 → datetime 클래스 → now 메서드로 시각 객체를 만든다. date는 `from datetime import date`로 직접 가져온 날짜 클래스, today()는 오늘 날짜를 만드는 메서드다. now.year는 속성이다. time.sleep은 모듈 함수이며 초 단위로 대기한다. random.randint는 양 끝을 포함하는 정수 난수 함수다. math.radians는 도를 라디안으로 변환하고 sin이 라디안 사인 값을 계산한다. now의 속성은 다시 호출하지 않으면 자동 갱신되지 않는다.

### 030

괄호 없는 self.convert는 함수/메서드 자체 전달이고, 괄호가 있으면 즉시 호출해 반환값을 전달한다. try에서 ValueError가 나면 나머지를 건너뛰고 해당 except로 가며 e는 예외 객체다. raise는 명시적 예외 발생이다. __name__ 관용구는 직접 실행 맥락을 구별한다. as pd는 별칭, cumsum은 누적합, plot은 그래프 생성이다. JavaScript에서 //는 한 줄 주석이고 Python에서는 몫 연산이므로 같지 않다.

## 코드 해석과 수정 031~060

### 031

`9 13`. 오른쪽은 대입 전 a와 b를 사용하므로 a=9, b=13이다.

### 032

다음 두 줄이다. 첫 출력은 끝에 |를 넣고 줄을 바꾸지 않는다. 둘째 문자열의 `\n`과 마지막 print의 기본 end가 줄바꿈을 만든다.

```text
봄/여름|가을
겨울
```

### 033

`69`. parts의 원소는 문자열이어서 이어 붙인다. 15가 필요하면 두 원소를 int로 바꾸어 더한다.

### 034

출력은 아래와 같다. -11=(-3)×4+1이다. 내림과 0 방향 절단의 차이다.

```text
-3
1
-2
```

### 035

다음 순서로 출력된다. 거듭제곱이 먼저이고 연쇄 거듭제곱은 오른쪽부터 결합한다. 7^3은 111 XOR 011=100이다.

```text
53
256
4
```

### 036

첫 문자열은 `'****42'`로 별 4개, 둘째는 `'   7'`로 공백 3개, 셋째는 `'23,000'`이다. 출력 형식만 바뀌며 정수 값은 유지된다.

### 037

첫째는 ValueError다. 자동 위치 {}와 수동 위치 {0}를 섞었다. 둘째는 `1 2`이며 여분 인수 3은 사용되지 않는다.

### 038

아래 세 줄이다. C와 A의 코드 차이는 2이고 66은 B다.

```text
2
B
00001010
```

### 039

아래와 같이 출력된다. a와 c는 동일한 리스트, b는 별개의 리스트다. 마지막 a는 [2,4,6]이다.

```text
True
False
True
[2, 4, 6]
```

### 040

False, True가 각 한 줄로 나오고 0 나눗셈 오류는 없다. 첫째 and의 앞이 거짓, 둘째 or의 앞이 참이어서 뒤를 평가하지 않는다.

### 041

다음 두 줄이다. 1100 & 1010=1000, OR는 1110, XOR는 0110이다. ~12=-13이다.

```text
8 14 6
-13 24 3
```

### 042

우수와 통과 두 줄이다. 둘째 if를 elif로 바꾸면 처음 참인 분기 '우수'만 실행한다.

```python
score = 88
if score >= 80:
    print('우수')
elif score >= 60:
    print('통과')
else:
    print('보완')
```

### 043

원본은 출력이 없다. 요구한 수정은 else를 바깥 if와 같은 들여쓰기에 두는 것이다. 수정하면 12를 출력한다.

```python
x, y = 2, 10
if x > 5:
    if y > 3:
        print(x * y)
else:
    print(x + y)
```

### 044

`충분`이며 반환 타입은 str이다. 정확히 3은 >=3에 포함된다.

### 045

아래 두 줄이다. show가 7을 출력하지만 명시적 return이 없어 result는 None이다.

```text
7
None
```

### 046

아래 네 리스트다. 마지막은 단계 방향이 잘못되어 비어 있다.

```text
[0, 1, 2]
[3, 6, 9]
[9, 7, 5, 3]
[]
```

### 047

초기화를 반복 밖으로 옮기고 stop을 6으로 한다. 합은 15다.

```python
total = 0
for i in range(1, 6):
    total += i
print(total)
```

### 048

n=1에서 출력 후 2가 된다. 2에서는 if가 거짓이라 증가문도 실행되지 않아 2에 머문다. n+=1을 if 밖·while 안으로 옮긴다. 그러면 1,3을 출력하고 n=5에서 끝난다.

### 049

아래 세 줄이다. 안쪽 출력은 총 6회, 줄바꿈은 3회다.

```text
@@@
@@
@
```

### 050

2회이며 `0 0`, `1 0` 순서다. j=1에서 안쪽 반복만 끝나고 다음 i로 넘어간다.

### 051

아래 두 줄이다. append는 리스트 자체를 바꾸고 None을 반환한다. insert(1,9)는 기존 인덱스 1의 5 앞에 9를 넣는다.

```text
[4, 9, 5, 6]
None
```

### 052

아래 세 줄이다. enumerate의 표시 번호만 1부터 시작하고 리스트의 실제 인덱스는 여전히 0부터다.

```text
1 달
2 별
r
```

### 053

첫째는 [8,2], 둘째는 []다. map 이터레이터를 첫 list가 소비했기 때문이다. 반복 사용하려면 첫 결과 리스트를 저장하거나 map을 새로 만든다.

### 054

중복 '8'은 한 개로 남아 정수 3과 8이 각각 한 개 포함된다. 가능한 표시는 [8,3] 또는 [3,8]이며 순서를 보장해 답할 수 없다. 한 환경에서 우연히 반복해 같아도 순서 규약이 생기는 것은 아니다.

### 055

첫째는 [0,0,5,0], 둘째는 [5]다. 첫째는 각 위치의 값을 변환하고 둘째는 조건을 만족하지 않는 원소를 제외한다.

### 056

순서대로 NameError, ValueError, TypeError, IndexError, ZeroDivisionError다. 한 블록으로 실행하면 첫 예외에서 멈추므로 독립 실행 조건이 중요하다.

### 057

`오전 12`. 0<12라 오전이고 0%12=0은 거짓으로 취급되어 or의 오른쪽 12를 쓴다.

### 058

2100은 False(100의 배수이고 400의 배수가 아님), 2400은 True(400의 배수), 2028은 True(4의 배수이고 100의 배수가 아님)다.

### 059

oops이면 `숫자 오류`, 4.5이면 `9.0`이다. 변환 실패 시 print(value*2)는 실행하지 않고 except로 간다. 정상일 때는 except를 건너뛴다.

### 060

1) 셀을 다시 실행하지 않았으므로 저장 출력은 여전히 `300`이다. 소스만 바뀌었을 뿐이다. 2) 커널 재시작 후 price를 정의한 셀을 실행하지 않았으면 다른 셀에서 NameError다. 현재 소스·저장 표시·커널 상태는 구분한다.

## 실전 구현 061~100

### 061

입력은 두 줄이다. 권수는 정수로 바꾸되 제목은 문자열로 둔다. 중괄호 안의 값을 출력 문장에 삽입한다.

```python
title = input()
count = int(input())
print(f'전시작: {title} | 수량: {count}권')
```

### 062

`\"`는 따옴표 한 개, `\\`는 백슬래시 한 개를 뜻한다. 작은따옴표 문자열 안의 큰따옴표는 이스케이프 없이도 가능하지만 여기서는 이스케이프 연습을 요구했다.

```python
name = input()
print('\"' + name + '\"')
print('안내\\접수')
```

### 063

길이 두 개 모두 cm에서 m로 바꾸므로 면적을 10000으로 나누는 것과 같다. 소수 4자리는 출력에서 정한다.

```python
width, height = map(int, input().split())
area = (width / 100) * (height / 100)
print(f'{area:.4f} m^2')
```

### 064

쉼표는 계산용 정수가 아닌 표시 형식에 붙인다. 총액을 먼저 계산하고 그 결과를 출력한다.

```python
count, price = map(int, input().split())
total = count * price
print(f'{total:,}원')
```

### 065

몫은 가득 찬 상자, 나머지는 남은 실험관이다. capacity>0 조건이 있어야 나눗셈이 가능하다.

```python
count, capacity = map(int, input().split())
print(f'상자 {count // capacity}개, 잔여 {count % capacity}개')
```

### 066

나머지 범위 0~7을 1~8로 옮긴다. n%8만 쓰면 8번째가 0이 되므로 (n-1)을 기준으로 잡는다.

```python
n = int(input())
number = (n - 1) % 8 + 1
print(number)
```

### 067

부피이므로 반지름의 세제곱이고 4/3은 일반 나눗셈이다. π는 math.pi 상수로 가져온다.

```python
import math
radius = float(input())
volume = (4 / 3) * math.pi * radius ** 3
print(f'{volume:.2f} cm^3')
```

### 068

sin(30)을 직접 쓰면 30라디안의 사인이 되어 의도와 다르다. radians 변환을 먼저 한다.

```python
import math
degree = float(input())
value = math.sin(math.radians(degree))
print(f'{value:.3f}')
```

### 069

두 번째 비트의 마스크는 2다. 비트 결과를 0과 비교해 bool로 출력한다.

```python
state = int(input())
print((state & 2) != 0)
```

### 070

~만 쓰면 음수가 되므로 하위 8비트 마스크를 쓴다. 입력이 0~255라 결과도 같은 범위다.

```python
state = int(input())
flipped = (~state) & 0xff
print(flipped, format(flipped, '08b'))
```

### 071

Z는 offset이 25여서 다음 offset이 0으로 돌아간다. 코드 포인트의 차이로 순번을 구한다.

```python
letter = input()
offset = ord(letter) - ord('A')
number = offset + 1
next_letter = chr(ord('A') + (offset + 1) % 26)
print(number, next_letter)
```

### 072

경계 결과는 7→0, 8→6000, 18→6000, 19→12000, 64→12000, 65→5000이다. elif에 도달할 때 이미 제외된 나이 구간을 활용한다.

```python
age = int(input())
if age < 8:
    fee = 0
elif age < 19:
    fee = 6000
elif age >= 65:
    fee = 5000
else:
    fee = 12000
print(fee)
```

### 073

취소 규칙을 먼저 검사해야 배터리가 90이어도 풍속 15에서 취소한다. 그 뒤에야 단축과 진행을 고른다.

```python
battery, wind = map(int, input().split())
if battery < 20 or wind >= 15:
    print('취소')
elif battery < 50:
    print('단축')
else:
    print('진행')
```

### 074

총점이 높아도 개별 과락을 우선한다. 소수 1자리로 반올림한 표시 문자열이 아닌 계산값으로 판정한다. (참고: `70*0.2`가 `14.000000000000002`가 되는 것처럼 실수 계산에는 아주 작은 오차가 생길 수 있다. 경계값 80을 정확히 다루고 싶다면 `(5*a + 3*b + 2*c) / 10`처럼 정수로 먼저 계산하는 방법도 있다.)

```python
a, b, c = map(int, input().split())
total = a * 0.5 + b * 0.3 + c * 0.2
if a < 30 or b < 30 or c < 30:
    status = '보완'
elif total >= 80:
    status = '선정'
else:
    status = '대기'
print(f'{total:.1f} {status}')
```

### 075

온도 25는 제외하고, 온도 10과 습도 60은 포함한다. 두 조건을 모두 만족해야 한다.

```python
temperature, humidity = map(int, input().split())
if 10 <= temperature < 25 and humidity <= 60:
    print('안전')
else:
    print('점검')
```

### 076

리스트 안의 원소 전체와 비교한다. 'te'는 'tea'의 부분 문자열이지만 이 리스트의 원소는 아니다.

```python
products = ['tea', 'water', 'juice']
code = input()
print('판매' if code in products else '없음')
```

### 077

정수 N>=0에서 4개 단위로 올림한다. 0일 때도 (0+3)//4=0으로 맞는다. 몫에 나머지 유무를 보고 1을 더하는 방법도 가능하다.

```python
count = int(input())
days = (count + 3) // 4
print(days)
```

### 078

종료 검사를 먼저 하므로 0은 합계와 횟수에 모두 포함되지 않는다. 첫 입력이 0이면 0 0이다.

```python
total = 0
reports = 0
while True:
    count = int(input())
    if count == 0:
        break
    total += count
    reports += 1
print(total, reports)
```

### 079

정수의 범위를 검증한다. 비정수 문자열 처리는 문제의 가정에 없으므로 별도의 예외 처리는 필요하지 않다.

```python
while True:
    people = int(input())
    if 1 <= people <= 6:
        print(f'예약 {people}명')
        break
    print('다시 입력')
```

### 080

40을 포함하려고 stop을 41로 준다. 마지막 뒤 공백은 문제에서 허용했다. 마지막 print는 줄바꿈이다.

```python
for number in range(4, 41, 4):
    print(number, end=' ')
print()
```

### 081

두 버전은 독립 프로그램으로 실행한다. 출력은 9개이고 마지막은 3이다. while의 최종 position은 0이다.

```python
position = 27
while position >= 3:
    print(position)
    position -= 3
```

```python
for position in range(27, 2, -3):
    print(position)
```

### 082

1~24에서는 4,8,16,20이므로 합 48과 개수 4다. 12와 24는 6의 배수라 제외한다.

```python
begin, end = map(int, input().split())
total = 0
count = 0
for number in range(begin, end + 1):
    if number % 4 == 0 and number % 6 != 0:
        total += number
        count += 1
print(total, count)
```

### 083

12는 한 반복에서 한 번만 더한다. 독립 if 두 개로 더하면 12가 중복된다.

```python
n = int(input())
total = 0
for number in range(1, n + 1):
    if number % 4 == 0 or number % 6 == 0:
        total += number
print(total)
```

### 084

행 번호가 곧 한 행의 # 개수다. 줄바꿈은 안쪽 반복 뒤에 둔다.

```python
n = int(input())
for row in range(1, n + 1):
    for column in range(row):
        print('#', end='')
    print()
```

### 085

가운데 최대 행을 두 번 출력하지 않도록 아래쪽은 n-1에서 시작한다. n=1이면 아래 반복은 0회다.

```python
n = int(input())
for level in range(1, n + 1):
    print(' ' * (n - level) + '*' * (2 * level - 1))
for level in range(n - 1, 0, -1):
    print(' ' * (n - level) + '*' * (2 * level - 1))
```

### 086

바깥 행 하나마다 안쪽 칸 세 개를 완주한다. 결과는 A1부터 B3까지 요구한 순서다.

```python
for row in 'AB':
    for column in range(1, 4):
        print(f'{row}{column}')
```

### 087

02d는 최소 폭 2의 0 채움 십진수다. 파일이 100개여도 번호를 잘라내지 않는다.

```python
files = input().split()
for number, filename in enumerate(files, start=1):
    print(f'{number:02d}: {filename}')
```

### 088

행 합은 5,7,6이고 전체는 18이다. 행 합 초기화는 바깥 반복 안, 전체 초기화는 반복 밖에 둔다.

```python
sales = [[2, 0, 3], [1, 4, 2], [0, 5, 1]]
total = 0
for number, row in enumerate(sales, start=1):
    row_total = 0
    for value in row:
        row_total += value
    print(f'{number}행: {row_total}')
    total += row_total
print(f'전체: {total}')
```

### 089

append의 반환값을 items에 재대입하지 않는다. insert(0, ...)는 맨 앞에 추가한다.

```python
items = ['box', 'tape']
new_item = input()
items.append(new_item)
items.insert(0, 'label')
print(items)
```

### 090

둘 다 [8,0,0,6,0]이다. 0은 원래 값이나 대체 값이나 같아서 >0을 써도 같은 결과다. 원본 points는 유지된다.

```python
points = [8, -4, 0, 6, -1]
first = list(map(lambda value: value if value >= 0 else 0, points))
second = [value if value >= 0 else 0 for value in points]
print(first)
print(second)
```

### 091

work[index]에 대입해야 원소가 바뀐다. for value in work에서 value에 재대입하면 반복 이름만 다른 객체를 가리킨다.

```python
work = [3, 1, 4]
for index in range(len(work)):
    work[index] = work[index] * 2
print(work)
```

### 092

뒤 if는 원소 선별, 앞 weight+5는 선별된 값의 변환이다. 조건에 해당하는 원소가 없으면 []다.

```python
weights = list(map(int, input().split()))
packed = [weight + 5 for weight in weights if weight >= 50]
print(packed)
```

### 093

출력은 12다. 함수 안에서 print만 하면 반환값이 None이 되므로 요구를 만족하지 못한다.

```python
def reward(price):
    return (price // 1000) * 3

print(reward(4500))
```

### 094

결과는 ['team-red','team-blue','team-gold']다. 여기서 +는 문자열 연결이다.

```python
colors = ['red', 'blue', 'gold']
teams = list(map(lambda color: 'team-' + color, colors))
print(teams)
```

### 095

n=0에서는 본문이 0회 실행되어 초기값 1이 남는다. 문제에서 정의한 0!과 일치한다.

```python
n = int(input())
ways = 1
for count in range(1, n + 1):
    ways *= count
print(ways)
```

### 096

가능한 길이 중 마지막, 즉 가장 큰 값을 기억한다. 18과 30의 공약수 1,2,3,6 중 최대는 6이다.

```python
a, b = map(int, input().split())
longest = 1
for length in range(1, min(a, b) + 1):
    if a % length == 0 and b % length == 0:
        longest = length
print(longest)
```

### 097

월만 검사하면 그 달의 모든 날짜를 잘못 True로 판정한다. 월과 일의 쌍을 함께 검사한다.

```python
month, day = map(int, input().split())
is_check_day = (month in [3, 12] and day == 31) or (month in [6, 9] and day == 30)
print(is_check_day)
```

### 098

직전 값을 갱신하기 전에 비교해야 한다. 첫 시행에서는 이전 값이 없으므로 성공할 수 없고 최소 생성 횟수는 2다. 난수에 따라 횟수가 달라진다.

```python
import random
previous = None
count = 0
while True:
    current = random.randint(1, 4)
    count += 1
    if previous is not None and current == previous:
        break
    previous = current
print(count, current)
```

### 099

float 변환 실패와 명시적 raise를 같은 except가 처리한다. 정상일 때는 except를 실행하지 않는다.

```python
try:
    quantity = float(input())
    if quantity < 0:
        raise ValueError('음수 불가')
    print(f'{quantity:.1f}')
except ValueError:
    print('입력 오류')
```

### 100

출력은 '환영합니다', '서윤님 환영합니다'의 두 줄이다. 딕셔너리 값으로 함수 자체를 보관했다가 키로 찾아 괄호로 호출한다. GUI도 command에 메서드 자체를 전달해 클릭할 때 나중에 호출한다. 함수도 값으로 전달·저장할 수 있다는 같은 원리다.

```python
def show_notice():
    print('환영합니다')

def make_notice(name):
    return f'{name}님 환영합니다'

settings = {'command': show_notice}
settings['command']()
print(make_notice('서윤'))
```

## 채점 후 다시 공부할 곳

001~010이 흔들리면 전체해설 1~4절, 011~020은 5~8절, 021~025는 9~11절, 026~028은 12~14절, 029~030은 15~18절을 다시 읽자. 031~060에서는 틀린 코드를 한 줄씩 상태표로 추적한다. 061~100에서는 예제 입력 외에 경계값을 하나 이상 추가해 스스로 확인한다.

이해의 마지막 검사는 정답을 덮고 코드를 다시 작성하는 것이다. 한 번에 재현되지 않으면 답만 외우지 말고 입력·계산·규칙·출력을 먼저 한 줄씩 적은 뒤 다시 작성하자.

