from flask import Flask, render_template, request, redirect, url_for, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'asfgbdszxf'  # 세션 보안을 위한 임의의 키 사용

# SQLite 데이터베이스 설정
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
db = SQLAlchemy(app)

# 모델 수정
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(80), nullable=False)

    def __repr__(self):
        return '<User %r>' % self.username

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)

# Flask 애플리케이션 컨텍스트 설정
with app.app_context():
    db.create_all()

# 회원가입 라우트
@app.route('/register', methods=['POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']

        new_user = User(username=username, email=email)
        new_user.set_password(password)  # 비밀번호를 해싱하여 저장

        db.session.add(new_user)
        db.session.commit()

        return '회원가입이 완료되었습니다.'

    return render_template('register.html')  # 회원가입 페이지 렌더링

# 로그인 라우트
@app.route('/login', methods=['POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username).first()

        if user and user.check_password(password):
            session['logged_in'] = True
            session['username'] = user.username
            return redirect(url_for('index'))  # 로그인 성공 시 홈페이지로 리다이렉트

    return render_template('login.html')  # 로그인 페이지 렌더링

# 로그아웃 라우트
@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    session.pop('username', None)
    return redirect(url_for('index'))  # 로그아웃 후 홈페이지로 리다이렉트

# 홈 라우트
@app.route('/')
def index():
    if 'logged_in' in session:
        return f"안녕하세요, {session['username']}님"  # 로그인한 사용자에게 환영 인사
    return '로그인이 필요합니다.'

# 나머지 코드 (HTML 템플릿, 실행 부분 등)은 유지되어야 합니다.

if __name__ == '__main__':
    app.run(debug=True)
